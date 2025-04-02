#!/bin/bash

# This script tests the biometric attendance endpoints with validation
# This version doesn't require jq to be installed

# Set your JWT token here - login first to get a valid token
TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IlNUVURFTlQiLCJzdWIiOiJzdHVkZW50QHRlc3QuY29tIiwiaWF0IjoxNzQzNjE3ODcxLCJleHAiOjE3NTIyNTc4NzF9.jWkttAUuMhSYx9cB--gbG5s8pojwFErT-bfH8yhqFRM"
API_BASE_URL="http://localhost:8081/api"

# Text colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Coordinate and course variables
# Valid coordinates - within geofence example
VALID_LAT=37.422
VALID_LNG=-122.084
# Invalid coordinates - outside geofence
INVALID_LAT=37.426
INVALID_LNG=-122.089
# Malformed coordinates - beyond valid range
MALFORMED_LAT=190.0
MALFORMED_LNG=380.0
# Valid course ID
COURSE_ID=2

echo -e "${YELLOW}Testing biometric attendance endpoints with validation...${NC}"
echo "=============================================="

# Test 1: Start verification with malformed data (invalid latitude)
echo -e "\n${YELLOW}Test 1: Start verification with invalid latitude${NC}"
echo "Sending request with latitude=$MALFORMED_LAT longitude=$VALID_LNG..."
curl -s -X POST "$API_BASE_URL/biometric-attendance/start-verification" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": $COURSE_ID, \"latitude\": $MALFORMED_LAT, \"longitude\": $VALID_LNG}"

echo -e "\n\n${YELLOW}Expected result:${NC} Should return validation error for latitude exceeding valid range"

# Test 2: Start verification with valid data (but possibly outside geofence)
echo -e "\n${YELLOW}Test 2: Start verification with valid coordinates (possibly outside geofence)${NC}"
echo "Sending request with latitude=$INVALID_LAT longitude=$INVALID_LNG..."
curl -s -X POST "$API_BASE_URL/biometric-attendance/start-verification" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": $COURSE_ID, \"latitude\": $INVALID_LAT, \"longitude\": $INVALID_LNG}"

echo -e "\n\n${YELLOW}Expected result:${NC} Should return geofence validation error with distance information"

# Test 3: Start verification with valid data, proper coordinates
echo -e "\n${YELLOW}Test 3: Start verification with valid data, proper coordinates${NC}"
echo "Sending request with latitude=$VALID_LAT longitude=$VALID_LNG..."
VERIFICATION_RESULT=$(curl -s -X POST "$API_BASE_URL/biometric-attendance/start-verification" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": $COURSE_ID, \"latitude\": $VALID_LAT, \"longitude\": $VALID_LNG}")

echo "$VERIFICATION_RESULT"

# Check for success in the response by simple string matching
if [[ "$VERIFICATION_RESULT" == *"\"success\":true"* ]]; then
  VERIFICATION_SUCCESS=true
else
  VERIFICATION_SUCCESS=false
fi

echo -e "\n\n${YELLOW}Expected result:${NC} Should return verification options if geofence check passes"

# Test 4: Simulating marking attendance with missing biometric data
echo -e "\n${YELLOW}Test 4: Mark attendance with missing biometric data${NC}"
curl -s -X POST "$API_BASE_URL/biometric-attendance/mark" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": $COURSE_ID, \"latitude\": $VALID_LAT, \"longitude\": $VALID_LNG}"

echo -e "\n\n${YELLOW}Expected result:${NC} Should return validation error for missing biometric verification data"

# Test 5: Simulating marking attendance with valid data but potentially invalid biometric response
if [ "$VERIFICATION_SUCCESS" = true ]; then
  echo -e "\n${YELLOW}Test 5: Mark attendance with simulated biometric data${NC}"
  DUMMY_BIOMETRIC_RESPONSE="{\"id\":\"abcd1234\",\"rawId\":\"abcd1234\",\"response\":{\"clientDataJSON\":\"eyJjaGFsbGVuZ2UiOiJhYmNkMTIzNCIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MCIsInR5cGUiOiJ3ZWJhdXRobi5nZXQifQ==\"}}"

  curl -s -X POST "$API_BASE_URL/biometric-attendance/mark" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"courseId\": $COURSE_ID, \"latitude\": $VALID_LAT, \"longitude\": $VALID_LNG, \"biometricVerification\": $DUMMY_BIOMETRIC_RESPONSE}"

  echo -e "\n\n${YELLOW}Expected result:${NC} May fail at biometric verification stage (which is expected without proper credentials)"
else
  echo -e "\n${RED}Skipping Test 5${NC} as verification options were not received"
fi

echo -e "\n${GREEN}All test requests completed.${NC}"
echo "These tests demonstrate the validation functionality."
echo "Note: Some tests are expected to fail as they specifically test validation."