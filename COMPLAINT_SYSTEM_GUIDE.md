# Complaint & Dispute Resolution System Guide

## Overview
The SkillsVerse platform includes a comprehensive complaint and dispute resolution system that allows customers to file complaints against completed jobs and enables admins to resolve disputes with refund options.

## System Architecture

### Backend Components
- **Complaint Model** (`models.js`): Stores complaint data including job reference, parties involved, status, and resolution details
- **Complaint Routes** (`routes.js`): API endpoints for filing, viewing, and resolving complaints
- **Escrow System** (`escrow.js`): Handles payment holds, refunds, and releases during dispute resolution

### Frontend Components
- **CustomerComplaintsPanel**: Customer interface for viewing and filing complaints
- **ComplaintModal**: Modal form for submitting new complaints with job selection
- **AdminDashboard**: Admin interface for reviewing and resolving disputes

## Workflow

### 1. Customer Files Complaint
**Requirements:**
- Job must be paid (`payment.status === 'paid'`)
- Complaint must be filed within 24 hours of payment
- Job cannot already have an existing complaint

**Process:**
1. Customer navigates to "Complaints & Disputes" tab
2. System loads paid jobs without existing complaints
3. Customer selects a job from dropdown
4. Customer provides:
   - Complaint title
   - Detailed description (min 20 characters)
   - Optional evidence (photo/video/document)
5. On submission:
   - Payment status changes to `under_review`
   - Automatic escrow release is paused
   - Admin is notified

### 2. Admin Reviews Complaint
**Admin Dashboard Features:**
- View all complaints with status indicators (pending/approved/rejected)
- Expandable complaint details showing:
  - Customer and worker information
  - Job reference
  - Complaint details and evidence
  - Payment status

**Resolution Options:**

#### Option A: Approve & Refund Customer
- Admin sets refund amount (defaults to full payment)
- Optional admin note for internal records
- System executes:
  - Stripe refund via payment intent
  - Job payment status changes to `refunded`
  - Complaint status changes to `approved`
  - Worker receives reduced/no payment

#### Option B: Reject & Release to Worker
- Admin rejects the complaint
- System executes:
  - Payment release to worker (90% of amount)
  - Platform keeps 10% fee
  - Job payment status changes to `released`
  - Complaint status changes to `rejected`

### 3. Payment Flow During Disputes

**Normal Flow:**
```
Payment → Held in Escrow → Auto-release after hold period → Worker receives 90%
```

**Dispute Flow:**
```
Payment → Held in Escrow → Complaint Filed → Under Review → Admin Decision
                                                    ↓
                                            Approve: Refund to Customer
                                            Reject: Release to Worker
```

## API Endpoints

### Customer Endpoints
- `POST /api/complaints` - File new complaint
- `GET /api/complaints/customer` - Get customer's complaints

### Admin Endpoints
- `GET /api/admin/complaints` - List all complaints
- `PUT /api/admin/complaints/:id/resolve` - Resolve complaint

### Request/Response Examples

**File Complaint:**
```javascript
POST /api/complaints
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  jobId: "job_id_here",
  title: "Poor work quality",
  details: "The work was not completed to satisfactory standards...",
  category: "Plumbing",
  evidence: <file> // optional
}
```

**Resolve Complaint (Approve):**
```javascript
PUT /api/admin/complaints/:id/resolve
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  action: "approve",
  refundAmount: 1500, // optional, defaults to full amount
  adminNote: "Customer provided evidence of incomplete work"
}
```

**Resolve Complaint (Reject):**
```javascript
PUT /api/admin/complaints/:id/resolve
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  action: "reject",
  adminNote: "Work completed as per agreement"
}
```

## Database Schema

### Complaint Model
```javascript
{
  jobId: ObjectId (ref: 'Job'),
  customer: ObjectId (ref: 'User'),
  worker: ObjectId (ref: 'Worker'),
  customerName: String,
  workerName: String,
  category: String,
  title: String,
  details: String,
  evidenceUrl: String,
  status: Enum ['pending', 'approved', 'rejected'],
  refundAmount: Number,
  adminNote: String,
  resolvedAt: Date,
  createdAt: Date
}
```

### Job Payment Status Updates
- `payment.holdStatus`: 'held' → 'under_review' → 'refunded'/'released'
- `payment.refundAmount`: Set when complaint approved
- `payment.releasedAt`: Set when payment released to worker

## Security & Validation

### Backend Validation
- JWT authentication required for all endpoints
- Role-based access control (customer vs admin)
- Payment status verification before complaint filing
- 24-hour complaint window enforcement
- Duplicate complaint prevention

### Frontend Validation
- Job selection required
- Title required
- Minimum 20 characters for details
- File type restrictions for evidence
- Real-time character count feedback

## Testing Checklist

### Customer Side
- [ ] File complaint against paid job
- [ ] Verify complaint appears in customer dashboard
- [ ] Attempt to file duplicate complaint (should fail)
- [ ] Try to file complaint on unpaid job (should fail)
- [ ] Upload evidence file successfully

### Admin Side
- [ ] View pending complaints in dashboard
- [ ] Expand complaint details
- [ ] Approve complaint with refund
- [ ] Reject complaint and release payment
- [ ] Verify payment status updates
- [ ] Check Stripe refund execution (if configured)

### Payment Integration
- [ ] Verify escrow hold on complaint filing
- [ ] Confirm refund processes correctly
- [ ] Verify worker payment release on rejection
- [ ] Check platform fee calculation (10%)

## Troubleshooting

### Complaints Not Showing in Admin Dashboard
1. Check backend server is running on port 5000
2. Verify admin JWT token is valid
3. Check browser console for API errors
4. Ensure complaints exist in database
5. Verify admin role permissions

### Complaint Submission Fails
1. Ensure job is paid (`payment.status === 'paid'`)
2. Check complaint is within 24-hour window
3. Verify no duplicate complaint exists
4. Check file upload size limits
5. Validate form data completeness

### Payment/Refund Issues
1. Verify Stripe keys are configured in `.env`
2. Check payment intent ID exists on job
3. Ensure sufficient funds for refund
4. Review Stripe dashboard for error logs
5. Test with Stripe test mode first

## Configuration

### Environment Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_CONNECT_DESTINATION_ACCOUNT=acct_...

# Escrow Configuration
ESCROW_HOLD_DAYS=7
ESCROW_HOLD_MINUTES=60  # Alternative: use minutes instead of days
ESCROW_CHECK_INTERVAL_MS=3600000  # 1 hour
```

## Future Enhancements

### Potential Improvements
- [ ] Real-time notifications for complaint status updates
- [ ] Dispute mediation workflow with worker response
- [ ] Partial refund options
- [ ] Complaint category analytics
- [ ] Automated dispute resolution suggestions
- [ ] Customer satisfaction ratings post-resolution
- [ ] Worker performance impact tracking

## Support

For issues or questions about the complaint system:
1. Check this guide for common scenarios
2. Review backend logs for detailed error messages
3. Verify database state for complaint records
4. Test API endpoints independently
5. Check Stripe dashboard for payment issues
