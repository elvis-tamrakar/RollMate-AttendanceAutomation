#!/bin/bash

# Set variables
BASE_URL="http://localhost:8081"

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "${BLUE}========== $1 ==========${NC}"
}

# Function to log in and get a token
get_auth_token() {
  local email=$1
  local password=$2
  
  echo -e "Logging in as $email..."
  
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")
  
  echo "Response: $LOGIN_RESPONSE"
  
  # Extract token
  AUTH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  
  if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Failed to get auth token.${NC}"
    return 1
  else
    echo -e "${GREEN}Successfully obtained auth token.${NC}"
    return 0
  fi
}

# Function to check if an endpoint exists
check_endpoint() {
  local endpoint=$1
  local method=${2:-GET}
  
  echo -e "Checking ${method} endpoint: ${endpoint}"
  
  RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X ${method} "${BASE_URL}${endpoint}" \
    -H "Authorization: Bearer ${AUTH_TOKEN}")
  
  if [ "${RESPONSE_CODE}" = "404" ]; then
    echo -e "${RED}Endpoint not found (404): ${endpoint}${NC}"
    return 1
  else
    echo -e "${GREEN}Endpoint exists (${RESPONSE_CODE}): ${endpoint}${NC}"
    return 0
  fi
}

# Main routine
print_header "AUTHENTICATION"

# Test login
get_auth_token "student@test.com" "password123"
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to authenticate. Exiting.${NC}"
  exit 1
fi

print_header "CHECKING BIOMETRIC ENDPOINTS"

echo "Testing different paths for biometric endpoints..."

# Common prefixes/paths for biometric endpoints
PREFIXES=(
  "/api/biometrics"
  "/biometrics"
  "/api/biometric"
  "/biometric"
  "/api/bio"
  "/bio"
)

# Common endpoint suffixes
ENDPOINTS=(
  "/status"
  "/register/start"
  "/register/complete"
  "/verify/start"
  "/verify/complete"
)

# Test all combinations
for prefix in "${PREFIXES[@]}"; do
  for endpoint in "${ENDPOINTS[@]}"; do
    check_endpoint "${prefix}${endpoint}"
  done
done

print_header "CHECKING BIOMETRIC ATTENDANCE ENDPOINTS"

# Common prefixes for biometric attendance
ATT_PREFIXES=(
  "/api/biometric-attendance"
  "/biometric-attendance"
  "/api/attendance/biometric"
  "/attendance/biometric"
)

# Common attendance endpoint suffixes
ATT_ENDPOINTS=(
  "/start-verification"
  "/verify"
  "/mark"
  "/status"
)

# Test all combinations for attendance
for prefix in "${ATT_PREFIXES[@]}"; do
  for endpoint in "${ATT_ENDPOINTS[@]}"; do
    check_endpoint "${prefix}${endpoint}" "POST"
  done
done

print_header "SEARCHING FOR OTHER ENDPOINTS"

# Check common controller endpoints
COMMON_ENDPOINTS=(
  "/api/health"
  "/actuator/health"
  "/health"
  "/api/attendance"
  "/attendance"
  "/api/courses"
  "/courses"
  "/api/classes"
  "/classes"
  "/api/students"
  "/students"
  "/api/users"
  "/users"
)

for endpoint in "${COMMON_ENDPOINTS[@]}"; do
  check_endpoint "${endpoint}"
done

print_header "ENDPOINT DISCOVERY COMPLETED"