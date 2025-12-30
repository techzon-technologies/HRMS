CREATE DATABASE IF NOT EXISTS hrms_db;
USE hrms_db;

-- ==========================================
-- 1. Core Organization Structure
-- ==========================================

-- Departments Table
CREATE TABLE IF NOT EXISTS Departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_employee_id INT, -- Foreign key added after Employees table creation
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table (Authentication)
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'hr', 'manager', 'employee') DEFAULT 'employee',
    employee_id INT, -- Link to employee profile if applicable
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees Table (Core Profile)
CREATE TABLE IF NOT EXISTS Employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE, -- Link to Users table
    department_id INT,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    position VARCHAR(100),
    employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
    joining_date DATE NOT NULL,
    status ENUM('active', 'on_leave', 'terminated', 'resigned') DEFAULT 'active',
    manager_id INT, -- Reporting manager
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES Employees(id) ON DELETE SET NULL
);

-- Add circular foreign key for Department Head
ALTER TABLE Departments
ADD FOREIGN KEY (head_employee_id) REFERENCES Employees(id) ON DELETE SET NULL;


-- ==========================================
-- 2. Time & Attendance
-- ==========================================

-- Attendance Records
CREATE TABLE IF NOT EXISTS Attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'absent', 'late', 'half_day', 'on_leave') DEFAULT 'absent',
    work_hours DECIMAL(5, 2), -- Calculated hours
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, date)
);

-- Leave Types (e.g., Annual, Sick, Casual)
CREATE TABLE IF NOT EXISTS LeaveTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    default_days_per_year INT DEFAULT 0,
    is_paid BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS LeaveRequests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by INT, -- Manager or HR who approved
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES LeaveTypes(id),
    FOREIGN KEY (approved_by) REFERENCES Employees(id)
);

-- Employee Leave Balances
CREATE TABLE IF NOT EXISTS LeaveBalances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL,
    total_days INT NOT NULL,
    used_days INT DEFAULT 0,
    remaining_days INT AS (total_days - used_days) STORED,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES LeaveTypes(id),
    UNIQUE KEY unique_balance (employee_id, leave_type_id, year)
);


-- ==========================================
-- 3. Payroll & Compensation
-- ==========================================

-- Salary Structure (Base definition for an employee)
CREATE TABLE IF NOT EXISTS SalaryStructures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    allowances DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'AED', -- Updated to AED as per benefits page
    effective_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE
);

-- Payroll Records (Processed Monthly Salaries)
CREATE TABLE IF NOT EXISTS Payrolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    bonus DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
    payment_date DATE,
    transaction_ref VARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_payroll (employee_id, month, year)
);

-- Benefits & Gratuity
CREATE TABLE IF NOT EXISTS Benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    years_of_service DECIMAL(4, 2) DEFAULT 0,
    basic_salary DECIMAL(10, 2) NOT NULL,
    gratuity_amount DECIMAL(15, 2) DEFAULT 0,
    status ENUM('accruing', 'paid_out') DEFAULT 'accruing',
    last_calculated DATE,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE
);

-- WPS Records (Wage Protection System)
CREATE TABLE IF NOT EXISTS WPSRecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id INT, -- Link to specific payroll run
    employee_id INT NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    salary_amount DECIMAL(10, 2),
    allowances_amount DECIMAL(10, 2),
    deductions_amount DECIMAL(10, 2),
    net_pay DECIMAL(10, 2),
    status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
    processed_date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (payroll_id) REFERENCES Payrolls(id) ON DELETE SET NULL
);


-- ==========================================
-- 4. HR & Administration
-- ==========================================

-- Company Assets (Laptops, Phones, etc.)
CREATE TABLE IF NOT EXISTS Assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    type ENUM('electronics', 'furniture', 'vehicle', 'other'),
    purchase_date DATE,
    value DECIMAL(10, 2),
    assigned_to INT, -- Employee ID
    status ENUM('available', 'assigned', 'maintenance', 'scrapped') DEFAULT 'available',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES Employees(id) ON DELETE SET NULL
);

-- Expenses / Reimbursements
CREATE TABLE IF NOT EXISTS Expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    category ENUM('travel', 'meals', 'supplies', 'internet', 'other'),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    receipt_url VARCHAR(255),
    expense_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    approved_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES Employees(id)
);

-- Disciplinary Records
CREATE TABLE IF NOT EXISTS DisciplinaryActions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    type ENUM('verbal_warning', 'written_warning', 'final_warning', 'suspension', 'termination'),
    reason TEXT,
    incident_date DATE,
    issued_by INT, -- HR or Manager
    status ENUM('active', 'under_review', 'resolved') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES Employees(id)
);

-- Compliance Audits
CREATE TABLE IF NOT EXISTS ComplianceAudits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(100) NOT NULL, -- e.g., 'Labor Law', 'Health & Safety'
    last_audit_date DATE,
    next_audit_date DATE,
    findings_count INT DEFAULT 0,
    score INT DEFAULT 0,
    status ENUM('compliant', 'needs_improvement', 'pending_review', 'non_compliant') DEFAULT 'pending_review',
    auditor_name VARCHAR(100),
    report_url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 5. Documents & Visas
-- ==========================================

-- Documents (General)
CREATE TABLE IF NOT EXISTS Documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    type ENUM('resume', 'contract', 'id_proof', 'tax_form', 'other'),
    file_url VARCHAR(255) NOT NULL,
    expiry_date DATE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE
);

-- Visas & Immigration
CREATE TABLE IF NOT EXISTS Visas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    type ENUM('work_visa', 'residence_visa', 'visit_visa') NOT NULL,
    visa_number VARCHAR(100) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('active', 'expiring_soon', 'expired') DEFAULT 'active',
    document_url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE
);

-- Driving Licences
CREATE TABLE IF NOT EXISTS DrivingLicences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    licence_number VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('light_vehicle', 'heavy_vehicle', 'motorcycle') NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('active', 'expiring_soon', 'expired') DEFAULT 'active',
    document_url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE
);

-- Health Insurance
CREATE TABLE IF NOT EXISTS HealthInsurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    provider_name VARCHAR(100),
    plan_name VARCHAR(100) DEFAULT 'Basic',
    dependents_count INT DEFAULT 0,
    premium_amount DECIMAL(10, 2),
    expiry_date DATE NOT NULL,
    status ENUM('active', 'expiring_soon', 'expired') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE
);


-- ==========================================
-- 6. Performance & Training
-- ==========================================

-- Performance Reviews
CREATE TABLE IF NOT EXISTS PerformanceReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_period_start DATE,
    review_period_end DATE,
    rating DECIMAL(2, 1), -- e.g., 4.5
    comments TEXT,
    status ENUM('scheduled', 'completed', 'acknowledged') DEFAULT 'scheduled',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES Employees(id)
);


-- ==========================================
-- 7. Fleet Management (Vehicles)
-- ==========================================

-- Vehicles
CREATE TABLE IF NOT EXISTS Vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('car', 'truck', 'bike', 'van'),
    status ENUM('active', 'maintenance', 'out_of_service') DEFAULT 'active',
    assigned_driver_id INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_driver_id) REFERENCES Employees(id) ON DELETE SET NULL
);

-- Vehicle Maintenance / Fines
CREATE TABLE IF NOT EXISTS VehicleIncidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    driver_id INT,
    type ENUM('fine', 'accident', 'maintenance', 'fuel'),
    description TEXT,
    amount DECIMAL(10, 2),
    incident_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'resolved') DEFAULT 'pending',
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES Employees(id) ON DELETE SET NULL
);

-- ==========================================
-- 8. System Settings
-- ==========================================

-- System Settings
CREATE TABLE IF NOT EXISTS SystemSettings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    company_email VARCHAR(255),
    company_phone VARCHAR(50),
    timezone VARCHAR(50),
    work_start_time TIME,
    work_end_time TIME,
    notification_leave_requests BOOLEAN DEFAULT TRUE,
    notification_attendance_alerts BOOLEAN DEFAULT TRUE,
    notification_document_uploads BOOLEAN DEFAULT FALSE,
    notification_payroll_reminders BOOLEAN DEFAULT TRUE,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
