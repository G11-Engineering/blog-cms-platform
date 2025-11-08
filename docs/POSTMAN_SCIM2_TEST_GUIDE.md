# Postman Guide: Testing Asgardeo SCIM2 API

## Overview

This guide walks you through testing the Asgardeo SCIM2 Users API using Postman to verify if the 403 error is due to API Authorization configuration.

---

## Step 1: Get M2M Access Token

### Request Configuration

**Method**: `POST`

**URL**:
```
https://api.asgardeo.io/t/g11engineering/oauth2/token
```

### Headers

| Key | Value |
|-----|-------|
| `Content-Type` | `application/x-www-form-urlencoded` |
| `Authorization` | `Basic WjR1aGhEc3daWkJVQmNKWDljYVZERkxteXMwYTpxWXY1ZmdjbmM4X3JnZnNmZ0VRdmtaaDR6Vlp0bVhCOWd2WU5vQXcycG5zYQ==` |

> **Note**: The Authorization header is Base64 encoded `ClientID:ClientSecret`
>
> To generate it yourself:
> 1. Combine: `Z4uhhDswzZBUBcJX9caVDFLmys0a:qYv5fgcnc8_rgfsfgEQvkZh1zVZtmXB9gvYNoAw2pnsa`
> 2. Encode to Base64
> 3. Prefix with `Basic `

### Body (x-www-form-urlencoded)

| Key | Value |
|-----|-------|
| `grant_type` | `client_credentials` |
| `scope` | `internal_user_mgt_update internal_user_mgt_view` |

### Expected Response (200 OK)

```json
{
  "access_token": "eyJ4NXQiOiJMSlBhbUl6Q2xoNW5TMG...",
  "scope": "internal_user_mgt_update internal_user_mgt_view",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Postman Screenshot Guide

1. Select **POST** method
2. Enter the token URL
3. Go to **Headers** tab:
   - Add `Content-Type: application/x-www-form-urlencoded`
   - Add `Authorization: Basic WjR1aGhEc3daWkJVQmNKWDljYVZERkxteXMwYTpxWXY1ZmdjbmM4X3JnZnNmZ0VRdmtaaDR6Vlp0bVhCOWd2WU5vQXcycG5zYQ==`
4. Go to **Body** tab:
   - Select **x-www-form-urlencoded**
   - Add key `grant_type` with value `client_credentials`
   - Add key `scope` with value `internal_user_mgt_update internal_user_mgt_view`
5. Click **Send**

### ✅ If Successful

Copy the `access_token` value from the response. You'll use it in Step 2.

**Example**:
```
eyJ4NXQiOiJMSlBhbUl6Q2xoNW5TMG1xTHhVeE5Jc09rNWciLCJraWQiOiJMSlBhbUl6Q2xoNW5TMG1xTHhVeE5Jc09rNWdfUlMyNTYiLCJ0eXAiOiJhdCtqd3QiLCJhbGciOiJSUzI1NiJ9...
```

---

## Step 2: Test SCIM2 Users API

### Request Configuration

**Method**: `GET`

**URL**:
```
https://api.asgardeo.io/t/g11engineering/scim2/Users?filter=userName%20eq%20viththagan.rn@gmail.com
```

**URL (unencoded)**:
```
https://api.asgardeo.io/t/g11engineering/scim2/Users?filter=userName eq viththagan.rn@gmail.com
```

### Headers

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {YOUR_ACCESS_TOKEN_FROM_STEP_1}` |
| `Accept` | `application/scim+json` |

> **Important**: Replace `{YOUR_ACCESS_TOKEN_FROM_STEP_1}` with the actual token you received in Step 1.

### Postman Screenshot Guide

1. Select **GET** method
2. Enter the SCIM2 Users URL with filter parameter
3. Go to **Headers** tab:
   - Add `Authorization: Bearer eyJ4NXQiOiJMSlBhbUl6Q2xoNW5TMG...` (use your actual token)
   - Add `Accept: application/scim+json`
4. Click **Send**

### Expected Responses

#### ❌ Current Response (403 Forbidden)

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
  "detail": "Operation is not permitted. You do not have permissions to make this request.",
  "status": 403
}
```

**This means**: API Authorization is NOT configured.

#### ✅ Success Response (200 OK) - After API Authorization

```json
{
  "totalResults": 1,
  "startIndex": 1,
  "itemsPerPage": 1,
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ListResponse"],
  "Resources": [
    {
      "emails": [
        {
          "type": "work",
          "value": "viththagan.rn@gmail.com",
          "primary": true
        }
      ],
      "meta": {
        "created": "2025-10-25T10:30:45.123Z",
        "location": "https://api.asgardeo.io/t/g11engineering/scim2/Users/e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b",
        "lastModified": "2025-11-05T14:22:10.456Z",
        "resourceType": "User"
      },
      "schemas": [
        "urn:ietf:params:scim:schemas:core:2.0:User",
        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
      ],
      "roles": [
        {
          "type": "default",
          "value": "Internal/everyone"
        }
      ],
      "name": {
        "givenName": "Viththagan",
        "familyName": "Ramanathan"
      },
      "id": "e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b",
      "userName": "viththagan.rn@gmail.com"
    }
  ]
}
```

**This means**: API Authorization is properly configured! 🎉

---

## Step 3: Alternative - Test with Another Scope

If Step 2 fails with 403, try testing with a different API that might be authorized:

### Test: Get Applications (Application Management API)

**Method**: `GET`

**URL**:
```
https://api.asgardeo.io/t/g11engineering/api/server/v1/applications
```

### Headers

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {YOUR_ACCESS_TOKEN}` |
| `Accept` | `application/json` |

### Why Test This?

- If this returns 200, it means your M2M application CAN access some APIs
- If this returns 403, it means your M2M application has NO API authorization
- This helps narrow down the issue

---

## Step 4: Test SCIM2 Lock User (If Step 2 Works)

Only test this if Step 2 returns 200 (user found).

### Request Configuration

**Method**: `PATCH`

**URL**:
```
https://api.asgardeo.io/t/g11engineering/scim2/Users/{USER_ID}
```

Replace `{USER_ID}` with the `id` from Step 2 response (e.g., `e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b`)

### Headers

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {YOUR_ACCESS_TOKEN}` |
| `Content-Type` | `application/json` |
| `Accept` | `application/scim+json` |

### Body (raw JSON)

```json
{
  "schemas": [
    "urn:ietf:params:scim:api:messages:2.0:PatchOp"
  ],
  "Operations": [
    {
      "op": "replace",
      "value": {
        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
          "accountLocked": true
        }
      }
    }
  ]
}
```

### Expected Response (200 OK)

```json
{
  "schemas": [
    "urn:ietf:params:scim:schemas:core:2.0:User",
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
  ],
  "id": "e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b",
  "userName": "viththagan.rn@gmail.com",
  "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
    "accountLocked": true
  }
}
```

---

## Quick Setup: Postman Collection

You can import this as a Postman collection:

```json
{
  "info": {
    "name": "Asgardeo SCIM2 API Test",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Get M2M Access Token",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/x-www-form-urlencoded"
          },
          {
            "key": "Authorization",
            "value": "Basic WjR1aGhEc3daWkJVQmNKWDljYVZERkxteXMwYTpxWXY1ZmdjbmM4X3JnZnNmZ0VRdmtaaDR6Vlp0bVhCOWd2WU5vQXcycG5zYQ=="
          }
        ],
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            {
              "key": "grant_type",
              "value": "client_credentials"
            },
            {
              "key": "scope",
              "value": "internal_user_mgt_update internal_user_mgt_view"
            }
          ]
        },
        "url": {
          "raw": "https://api.asgardeo.io/t/g11engineering/oauth2/token",
          "protocol": "https",
          "host": ["api", "asgardeo", "io"],
          "path": ["t", "g11engineering", "oauth2", "token"]
        }
      }
    },
    {
      "name": "2. Get SCIM2 User by Email",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          },
          {
            "key": "Accept",
            "value": "application/scim+json"
          }
        ],
        "url": {
          "raw": "https://api.asgardeo.io/t/g11engineering/scim2/Users?filter=userName eq viththagan.rn@gmail.com",
          "protocol": "https",
          "host": ["api", "asgardeo", "io"],
          "path": ["t", "g11engineering", "scim2", "Users"],
          "query": [
            {
              "key": "filter",
              "value": "userName eq viththagan.rn@gmail.com"
            }
          ]
        }
      }
    },
    {
      "name": "3. Lock User Account (PATCH)",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/scim+json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"schemas\": [\n    \"urn:ietf:params:scim:api:messages:2.0:PatchOp\"\n  ],\n  \"Operations\": [\n    {\n      \"op\": \"replace\",\n      \"value\": {\n        \"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User\": {\n          \"accountLocked\": true\n        }\n      }\n    }\n  ]\n}"
        },
        "url": {
          "raw": "https://api.asgardeo.io/t/g11engineering/scim2/Users/{{user_id}}",
          "protocol": "https",
          "host": ["api", "asgardeo", "io"],
          "path": ["t", "g11engineering", "scim2", "Users", "{{user_id}}"]
        }
      }
    }
  ]
}
```

### To Import in Postman:

1. Open Postman
2. Click **Import** button (top left)
3. Copy the JSON above
4. Paste into the import dialog
5. Click **Import**

### Using Variables:

After Step 1 (Get Token), manually set these variables:
- `access_token`: The token from Step 1 response
- `user_id`: The user ID from Step 2 response

---

## Troubleshooting

### Issue 1: "Authorization header not found" or "Invalid credentials"

**Cause**: The Basic auth header is incorrect.

**Solution**:
1. Verify Client ID: `Z4uhhDswzZBUBcJX9caVDFLmys0a`
2. Verify Client Secret: `qYv5fgcnc8_rgfsfgEQvkZh1zVZtmXB9gvYNoAw2pnsa`
3. Regenerate Base64:
   ```
   echo -n "Z4uhhDswzZBUBcJX9caVDFLmys0a:qYv5fgcnc8_rgfsfgEQvkZh1zVZtmXB9gvYNoAw2pnsa" | base64
   ```
4. Use the result with `Basic ` prefix

### Issue 2: Token request works but SCIM2 returns 403

**Cause**: API Authorization not configured (this is your current issue).

**Solution**: Configure API Authorization in Asgardeo Console as described in [ASGARDEO_SCIM_API_ISSUE.md](./ASGARDEO_SCIM_API_ISSUE.md)

### Issue 3: "invalid_scope" error

**Cause**: The requested scopes are not configured for the M2M application.

**Solution**:
1. Go to Asgardeo Console
2. Navigate to your M2M application
3. Go to the **Scopes** section
4. Ensure these are checked:
   - `internal_user_mgt_update`
   - `internal_user_mgt_view`

---

## Expected Results Summary

| Test | Current Result | After API Authorization |
|------|----------------|-------------------------|
| **Step 1: Get Token** | ✅ 200 OK | ✅ 200 OK |
| **Step 2: Get User** | ❌ 403 Forbidden | ✅ 200 OK |
| **Step 4: Lock User** | ❌ 403 Forbidden | ✅ 200 OK |

Once you see **200 OK** responses in Step 2, your user status sync feature will work automatically!

---

## Next Steps After Postman Test

1. **If you get 200 OK in Step 2**:
   - ✅ API Authorization is configured correctly
   - Run `node test-scim-api.js` again to verify
   - Test user status toggle in admin panel
   - The sync feature should work now!

2. **If you still get 403 in Step 2**:
   - Check if there's an "API Authorization" tab in your M2M application
   - If not visible, contact WSO2 Asgardeo support
   - Alternatively, check your subscription tier
   - Consider the workaround mentioned in [ASGARDEO_SCIM_API_ISSUE.md](./ASGARDEO_SCIM_API_ISSUE.md)

---

## References

- [Asgardeo SCIM2 Users API Docs](https://wso2.com/asgardeo/docs/apis/scim2/scim2-users-rest-api/)
- [Asgardeo Management API Docs](https://wso2.com/asgardeo/docs/apis/)
- [SCIM2 Specification (RFC 7644)](https://datatracker.ietf.org/doc/html/rfc7644)
