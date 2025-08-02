
#!/bin/bash

echo "=== Testing Court Case Management System API ==="
echo "Starting server test..."

# Base URL
BASE_URL="http://localhost:5000"

echo ""
echo "1. Testing Root Endpoint"
echo "========================"
curl -X GET "$BASE_URL/" | jq '.' 2>/dev/null || curl -X GET "$BASE_URL/"

echo ""
echo ""
echo "2. Testing User Signup"
echo "======================"
curl -X POST "$BASE_URL/ccms/user/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "phone": "9876543210",
    "addressState": "Delhi",
    "addressDistrict": "Central Delhi"
  }' | jq '.' 2>/dev/null || curl -X POST "$BASE_URL/ccms/user/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "phone": "9876543210",
    "addressState": "Delhi",
    "addressDistrict": "Central Delhi"
  }'

echo ""
echo ""
echo "3. Testing User Login"
echo "===================="
curl -X POST "$BASE_URL/ccms/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }' | jq '.' 2>/dev/null || curl -X POST "$BASE_URL/ccms/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'

echo ""
echo ""
echo "4. Testing Get User Cases (using dummy user ID: 1)"
echo "=================================================="
curl -X GET "$BASE_URL/ccms/user/1" | jq '.' 2>/dev/null || curl -X GET "$BASE_URL/ccms/user/1"

echo ""
echo ""
echo "5. Testing Get All Cases (Admin)"
echo "================================"
curl -X GET "$BASE_URL/ccms/admin/1" | jq '.' 2>/dev/null || curl -X GET "$BASE_URL/ccms/admin/1"

echo ""
echo ""
echo "6. Testing Create New Case"
echo "=========================="
curl -X POST "$BASE_URL/ccms/admin/newcase" \
  -H "Content-Type: application/json" \
  -d '{
    "plaintiff_id": 1,
    "case_title": "Test Case from API",
    "case_description": "This is a test case created via API",
    "court_id": 1,
    "judge_id": 1,
    "lawyer_id": 1,
    "case_type": "Civil",
    "urgency_level": "Medium"
  }' | jq '.' 2>/dev/null || curl -X POST "$BASE_URL/ccms/admin/newcase" \
  -H "Content-Type: application/json" \
  -d '{
    "plaintiff_id": 1,
    "case_title": "Test Case from API",
    "case_description": "This is a test case created via API",
    "court_id": 1,
    "judge_id": 1,
    "lawyer_id": 1,
    "case_type": "Civil",
    "urgency_level": "Medium"
  }'

echo ""
echo ""
echo "7. Testing Get Notifications"
echo "============================"
curl -X GET "$BASE_URL/ccms/notifications/1" | jq '.' 2>/dev/null || curl -X GET "$BASE_URL/ccms/notifications/1"

echo ""
echo ""
echo "8. Testing Create Notification"
echo "=============================="
curl -X POST "$BASE_URL/ccms/notifications/create" \
  -H "Content-Type: application/json" \
  -d '{
    "citizen_id": 1,
    "title": "Test Notification",
    "message": "This is a test notification from API",
    "notification_type": "case_update"
  }' | jq '.' 2>/dev/null || curl -X POST "$BASE_URL/ccms/notifications/create" \
  -H "Content-Type: application/json" \
  -d '{
    "citizen_id": 1,
    "title": "Test Notification",
    "message": "This is a test notification from API",
    "notification_type": "case_update"
  }'

echo ""
echo ""
echo "9. Testing Generate OTP"
echo "======================="
curl -X POST "$BASE_URL/ccms/otp/generate-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }' | jq '.' 2>/dev/null || curl -X POST "$BASE_URL/ccms/otp/generate-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'

echo ""
echo ""
echo "10. Testing Update Case Status"
echo "=============================="
curl -X PATCH "$BASE_URL/ccms/admin/update/1" \
  -H "Content-Type: application/json" \
  -d '{
    "new_status": "ACCEPTED",
    "next_hearing": "2024-02-15"
  }' | jq '.' 2>/dev/null || curl -X PATCH "$BASE_URL/ccms/admin/update/1" \
  -H "Content-Type: application/json" \
  -d '{
    "new_status": "ACCEPTED",
    "next_hearing": "2024-02-15"
  }'

echo ""
echo ""
echo "11. Testing File Upload (requires actual PDF file)"
echo "=================================================="
echo "Note: This test requires a PDF file. Creating a dummy text file for demo..."
echo "This is a test document" > test.txt
curl -X POST "$BASE_URL/ccms/upload" \
  -F "file=@test.txt" 2>/dev/null || echo "File upload test skipped (requires PDF file)"

echo ""
echo ""
echo "12. Testing Invalid Route (should redirect to /)"
echo "================================================"
curl -X GET "$BASE_URL/invalid-route" | jq '.' 2>/dev/null || curl -X GET "$BASE_URL/invalid-route"

echo ""
echo ""
echo "=== API Testing Complete ==="
