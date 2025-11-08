/**
 * Test script to verify Asgardeo SCIM2 API access
 * This will help diagnose the 403 permission error
 */

const https = require('https');

// M2M Application Credentials
const config = {
  baseUrl: 'https://api.asgardeo.io/t/g11engineering',
  clientId: 'Z4uhhDswzZBUBcJX9caVDFLmys0a',
  clientSecret: 'qYv5fgcnc8_rgfsfgEQvkZh1zVZtmXB9gvYNoAw2pnsa',
  orgName: 'g11engineering'
};

console.log('\n================================================');
console.log('🔬 ASGARDEO SCIM2 API TEST');
console.log('================================================\n');

// Step 1: Get M2M Access Token
function getAccessToken() {
  return new Promise((resolve, reject) => {
    console.log('📍 Step 1: Requesting M2M Access Token');
    console.log(`   Endpoint: ${config.baseUrl}/oauth2/token`);
    console.log(`   Client ID: ${config.clientId}`);
    console.log(`   Grant Type: client_credentials`);
    console.log(`   Scopes: internal_user_mgt_update internal_user_mgt_view\n`);

    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const postData = 'grant_type=client_credentials&scope=internal_user_mgt_update internal_user_mgt_view';

    const options = {
      hostname: 'api.asgardeo.io',
      path: `/t/${config.orgName}/oauth2/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Token Response Status: ${res.statusCode}`);

        try {
          const tokenData = JSON.parse(data);

          if (tokenData.access_token) {
            console.log(`✅ Access Token Received: ${tokenData.access_token.substring(0, 30)}...`);
            console.log(`   Expires In: ${tokenData.expires_in} seconds`);
            console.log(`   Token Type: ${tokenData.token_type}`);
            console.log(`   Scope: ${tokenData.scope}\n`);
            resolve(tokenData.access_token);
          } else {
            console.error('❌ No access token in response:', tokenData);
            reject(new Error('No access token received'));
          }
        } catch (error) {
          console.error('❌ Failed to parse token response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Token request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Step 2: Test SCIM2 Users API
function testSCIM2API(accessToken) {
  return new Promise((resolve, reject) => {
    console.log('📍 Step 2: Testing SCIM2 Users API');
    console.log(`   Endpoint: ${config.baseUrl}/scim2/Users`);
    console.log(`   Method: GET`);
    console.log(`   Filter: userName eq viththagan.rn@gmail.com`);
    console.log(`   Authorization: Bearer ${accessToken.substring(0, 30)}...\n`);

    const options = {
      hostname: 'api.asgardeo.io',
      path: `/t/${config.orgName}/scim2/Users?filter=${encodeURIComponent('userName eq viththagan.rn@gmail.com')}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/scim+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 SCIM2 Response Status: ${res.statusCode}`);
        console.log(`📊 Response Headers:`, JSON.stringify(res.headers, null, 2));
        console.log(`📊 Response Body:\n`, data);

        try {
          const responseData = JSON.parse(data);

          if (res.statusCode === 200) {
            console.log('\n✅ SUCCESS! SCIM2 API is accessible');
            console.log(`   Found ${responseData.totalResults || 0} users`);
            if (responseData.Resources && responseData.Resources.length > 0) {
              console.log(`   User ID: ${responseData.Resources[0].id}`);
              console.log(`   Username: ${responseData.Resources[0].userName}`);
            }
          } else if (res.statusCode === 403) {
            console.log('\n❌ PERMISSION DENIED (403)');
            console.log('   Error:', responseData.detail || responseData.message);
            console.log('\n💡 DIAGNOSIS:');
            console.log('   The M2M application successfully obtained a token,');
            console.log('   but Asgardeo is denying access to the SCIM2 Users API.');
            console.log('\n   Possible causes:');
            console.log('   1. SCIM2 API not available in your Asgardeo subscription tier');
            console.log('   2. M2M application needs "API Authorization" in Asgardeo Console');
            console.log('   3. Organization-level SCIM2 API access not enabled');
            console.log('   4. Additional permissions required beyond scopes');
          } else {
            console.log('\n⚠️ UNEXPECTED RESPONSE');
            console.log('   Status:', res.statusCode);
            console.log('   Data:', responseData);
          }
        } catch (error) {
          console.error('\n❌ Failed to parse SCIM2 response:', data);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ SCIM2 request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    const accessToken = await getAccessToken();
    await testSCIM2API(accessToken);

    console.log('\n================================================');
    console.log('✅ TEST COMPLETE');
    console.log('================================================\n');
  } catch (error) {
    console.error('\n================================================');
    console.error('❌ TEST FAILED:', error.message);
    console.error('================================================\n');
  }
}

runTest();
