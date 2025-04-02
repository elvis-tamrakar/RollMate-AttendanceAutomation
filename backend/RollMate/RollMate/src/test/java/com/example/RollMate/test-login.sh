#!/bin/bash

# This script tests the authentication endpoints without using jq

# API base URL - update this to match your Spring Boot server
API_BASE_URL="http://localhost:8081/api"

# Colors for better console output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test credentials - update these with valid credentials from your database
TEST_EMAIL="teacher.test2@example.com"
TEST_PASSWORD="Test@Teacher123"
TEST_NAME="Test Teacher"
# Role should be uppercase to match the enum (TEACHER, STUDENT, or ADMIN)
TEST_ROLE="TEACHER"

# File to store token for later use
TOKEN_FILE="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IlRFQUNIRVIiLCJzdWIiOiJ0ZWFjaGVyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzNjE4OTczLCJleHAiOjE3NDM3MDUzNzN9.Ymj0yS_6CgCQwAvhZgXUqlHZU1we6sTTGsqwq0bGapg"

echo -e "${YELLOW}Testing Authentication Endpoints${NC}"
echo "=============================================="

# Test 1: Registration
echo -e "\n${YELLOW}Test 1: User Registration${NC}"
echo "Registering new user with email: $TEST_EMAIL"

REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\", \"password\":\"$TEST_PASSWORD\", \"name\":\"$TEST_NAME\", \"role\":\"$TEST_ROLE\"}")

echo "Response:"
echo "$REGISTER_RESPONSE"

# Check if registration succeeded (basic string check)
if [[ "$REGISTER_RESPONSE" == *"\"success\":true"* ]] || [[ "$REGISTER_RESPONSE" == *"already exists"* ]]; then
  echo -e "\n${GREEN}Registration succeeded or user already exists. Proceeding to login.${NC}"
else
  echo -e "\n${RED}Registration failed! Please check the response.${NC}"
fi

# Test 2: Login
echo -e "\n${YELLOW}Test 2: User Login${NC}"
echo "Logging in with email: $TEST_EMAIL"

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\", \"password\":\"$TEST_PASSWORD\"}")

echo "Response:"
echo "$LOGIN_RESPONSE"

# Simple string check for token in response
if [[ "$LOGIN_RESPONSE" == *"token"* ]]; then
  # Extract token using basic string manipulation
  # This is a simple approach and may break with complex JSON
  TOKEN=$(echo "$LOGIN_RESPONSE" | sed -e 's/.*"token":"\([^"]*\)".*/\1/')
  echo -e "\n${GREEN}Login succeeded! JWT token received.${NC}"
  echo "Token: $TOKEN"
  echo "$TOKEN" > "$TOKEN_FILE"
  echo "Token saved to $TOKEN_FILE for use in other test scripts."
else
  echo -e "\n${RED}Login failed! No token found in response.${NC}"
  exit 1
fi

# Test 3: Get Current User
echo -e "\n${YELLOW}Test 3: Get Current User${NC}"
echo "Fetching user profile with the JWT token"

curl -s -X GET "$API_BASE_URL/user/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n${YELLOW}Expected Result:${NC} Should return the user profile information"

# Test 4: Validate Token
echo -e "\n${YELLOW}Test 4: Validate Token${NC}"
echo "Checking if token is valid"

curl -s -X GET "$API_BASE_URL/auth/validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n${YELLOW}Expected Result:${NC} Should return validation status of the JWT token"

echo -e "\n${GREEN}Authentication tests completed.${NC}"
echo "If login was successful, the JWT token is saved to $TOKEN_FILE."
echo "You can use this token in other test scripts by setting TOKEN=\$(cat $TOKEN_FILE)"