#!/bin/bash

# Set variables
BASE_URL="http://localhost:8081"
AUTH_TOKEN=""
STUDENT_USERNAME="student@test.com"
STUDENT_PASSWORD="password123"
COURSE_ID=1  # Replace with an actual course ID from your database

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "${BLUE}========== $1 ==========${NC}"
}

# Function to check response
check_response() {
  if [[ $1 == *"$2"* ]]; then
    echo -e "${GREEN}✓ Success: $3${NC}"
  else
    echo -e "${RED}✗ Failed: $3${NC}"
    echo "Response: $1"
  fi
}

# Login to get JWT token
print_header "LOGGING IN AS STUDENT"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${STUDENT_USERNAME}\",\"password\":\"${STUDENT_PASSWORD}\"}")

echo "Login response: $LOGIN_RESPONSE"

# Extract token from response
AUTH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}Failed to get auth token. Check credentials or server status.${NC}"
  exit 1
fi

echo "Auth token: $AUTH_TOKEN"

# Test if login was successful - print the decoded token
print_header "DECODED JWT TOKEN"
# Split the token and decode the payload (middle part)
PAYLOAD=$(echo $AUTH_TOKEN | cut -d'.' -f2)
# Add padding if needed
PADDING_NEEDED=$(expr 4 - ${#PAYLOAD} % 4)
if [ $PADDING_NEEDED -lt 4 ]; then
  PADDING=$(printf '%*s' $PADDING_NEEDED | tr ' ' '=')
  PAYLOAD="${PAYLOAD}${PADDING}"
fi
# Decode
DECODED=$(echo $PAYLOAD | base64 -d 2>/dev/null || echo $PAYLOAD | base64 --decode 2>/dev/null)
echo -e "Decoded token: $DECODED"

# Check if biometric endpoints are accessible
print_header "CHECKING API AVAILABILITY"

# 1. Check if biometrics status endpoint is available
BIO_STATUS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/biometrics/status" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

if [ "$BIO_STATUS_RESPONSE" -eq "200" ] || [ "$BIO_STATUS_RESPONSE" -eq "401" ] || [ "$BIO_STATUS_RESPONSE" -eq "403" ]; then
  echo -e "${GREEN}✓ Biometrics status endpoint accessible: $BIO_STATUS_RESPONSE${NC}"
else
  echo -e "${RED}✗ Biometrics status endpoint not accessible: $BIO_STATUS_RESPONSE${NC}"
fi

# 2. Check if biometric attendance endpoint is available
BIO_ATTENDANCE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/biometric-attendance/start-verification?courseId=1&latitude=35.7749&longitude=-78.6589" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

if [ "$BIO_ATTENDANCE_RESPONSE" -eq "200" ] || [ "$BIO_ATTENDANCE_RESPONSE" -eq "401" ] || [ "$BIO_ATTENDANCE_RESPONSE" -eq "403" ]; then
  echo -e "${GREEN}✓ Biometric attendance endpoint accessible: $BIO_ATTENDANCE_RESPONSE${NC}"
else
  echo -e "${RED}✗ Biometric attendance endpoint not accessible: $BIO_ATTENDANCE_RESPONSE${NC}"
fi

# 3. Health check
print_header "SERVER HEALTH CHECK"
HEALTH_RESPONSE=$(curl -s -X GET "${BASE_URL}/actuator/health" 2>/dev/null || echo "Failed to connect")

if [[ $HEALTH_RESPONSE == *"UP"* ]]; then
  echo -e "${GREEN}✓ Server is UP and healthy${NC}"
else
  echo -e "${RED}✗ Server health check failed: $HEALTH_RESPONSE${NC}"
fi

# 4. Get available courses for testing
print_header "AVAILABLE COURSES"
COURSES_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/classes" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

echo "Courses response:"
echo "$COURSES_RESPONSE" | grep -Eo '"id":[0-9]+,"name":"[^"]+"' | while read -r line ; do
  ID=$(echo $line | grep -Eo '"id":[0-9]+' | grep -Eo '[0-9]+')
  NAME=$(echo $line | grep -Eo '"name":"[^"]+"' | sed 's/"name":"//g' | sed 's/"//g')
  echo "Course ID: $ID, Name: $NAME"
done

print_header "TEST COMPLETED"