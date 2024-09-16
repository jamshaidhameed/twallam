const axios = require("axios");

class ZidApiService {
     async getTokensByCode(code) {
        const url = `${process.env.ZID_AUTH_URL}/oauth/token`;
        const requestBody = {
            grant_type: 'authorization_code',
            client_id: process.env.ZID_CLIENT_ID,
            client_secret: process.env.ZID_CLIENT_SECRET,
            redirect_uri: `${process.env.MY_BACKEND_URL}auth/zid/callback`,
            code: code,
        };
        try {
            const response = await axios.post(url, requestBody);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

       async getMerchantProfile(managerToken, authToken) {
        const url = `${process.env.ZID_BASE_API_URL}/managers/account/profile`;
        const requestHeaders = {
            Authorization: `Bearer ${authToken}`,
            'X-Manager-Token': managerToken,
            Accept: 'application/json',
        };

        try {
            const response = await axios.get(url, { headers: requestHeaders });
            return response.data;
        } catch (e) {
            console.error(e);
        }
    }

    async getCustomers(data) {

         console.log('gett cus',data)
        const url = "https://api.zid.sa/v1/managers/store/customers";
         const header = {
             // 'Authorization': `Bearer ${data.token}`,
             'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzNTI0IiwianRpIjoiODQ3ZTMwYzY4YjJkNzc4ZmNmNjAwOGFkNTU2MzUzZjNhM2NlYWUzYjk5YmY3Mjk4MTM0YjNlNDQzMDY5OGU2NTkyYzUzNzk0MTVlOWM3NzYiLCJpYXQiOjE3MjY0NzA3NTIuMTYwMzgzLCJuYmYiOjE3MjY0NzA3NTIuMTYwMzg2LCJleHAiOjE3NTgwMDY3NTIuMTI0NDIyLCJzdWIiOiI2NDIzNDgiLCJzY29wZXMiOlsidGhpcmRfYWNjb3VudF9yZWFkIiwidGhpcmRfdmF0X3JlYWQiLCJ0aGlyZF9jYXRlZ29yaWVzX3JlYWQiLCJ0aGlyZF9jYXRlZ29yaWVzX3dyaXRlIiwidGhpcmRfY3VzdG9tZXJzX3JlYWQiLCJ0aGlyZF9jdXN0b21lcnNfd3JpdGUiLCJ0aGlyZF9vcmRlcl9yZWFkIiwidGhpcmRfb3JkZXJfd3JpdGUiLCJ0aGlyZF9jb3Vwb25zX3dyaXRlIiwidGhpcmRfZGVsaXZlcnlfb3B0aW9uc19yZWFkIiwidGhpcmRfZGVsaXZlcnlfb3B0aW9uc193cml0ZSIsInRoaXJkX2FiYW5kb25lZF9jYXJ0c19yZWFkIiwidGhpcmRfcGF5bWVudF9yZWFkIiwidGhpcmRfd2ViaG9va19yZWFkIiwidGhpcmRfcHJvZHVjdF9yZWFkIiwidGhpcmRfcHJvZHVjdF93cml0ZSIsInRoaXJkX2NvdW50cmllc19yZWFkIiwidGhpcmRfY2F0YWxvZ193cml0ZSIsInRoaXJkX3N1YnNjcmlwdGlvbl9yZWFkIiwidGhpcmRfaW52ZW50b3J5X3JlYWQiLCJ0aGlyZF9qc193cml0ZSIsInRoaXJkX2J1bmRsZV9vZmZlcnNfcmVhZCIsInRoaXJkX2NyZWF0ZV9vcmRlciIsInRoaXJkX3Byb2R1Y3Rfc3RvY2tfcmVhZCIsInRoaXJkX3Byb2R1Y3Rfc3RvY2tfd3JpdGUiLCJ0aGlyZF9pbnZlbnRvcnlfd3JpdGUiLCJlbWJlZGRlZF9hcHBzX3Rva2Vuc193cml0ZSIsInRoaXJkX2xveWFsdHlfcmVhZCIsInRoaXJkX2xveWFsdHlfd3JpdGUiLCJ0aGlyZF9vcmRlcl9yZXZlcnNlX3dyaXRlIiwidGhpcmRfb3JkZXJfcmV2ZXJzZV9yZWFkIl19.BjUzt1C9egY4Lk2zZo5YPoqIuCnROo3esCtkvQS79znaCSEvHv5dunEYk_Jk64d0M_t9_f6VZugtCgdB-inIF8VOlo3S_ry_cMXAFaN6LRXnf5GfbDMxzatTfUflik0WlJRhAToZzi7xkxUTNQ_za-Mj8xKo5kLllbRUFoNv-6fd4-n0nUOiBPAMjM94GJ2Z7yptqX_0kr5ougAo1OkdK4zGPiswd9659UXqbmkJi-zW13trMA64IhR3z8sbIYz8kdcZFw5VO1RgwhLIUwkNhWh893yomnFEphJ9n-_eyM2PgQMM8QdPnBFaocC9KCqU7XLnsmaepipTCEBn3F--FSE0quKoUr5j3rYNAGMIkvADmjCA0O448ebPSoW9QZcTkimJe4R5yO0ZLGz40N18tGXKmYSHLY4FzDUFRe3vABy8d7w5t8F4lBLvyG98nrTeWSSwkH1V0mosmQm4eDkOPoPeFMrFFzo8R1Ec3jkHx7zqGqvJFPYZnwTsdN_t9MKpytj66E4UDA-Dn9B2FD2JXfgyWGaryo76goJZplyDAPx4M6WenUjo8piHkVbMQQmPiDqcfrofXas130LSVYc1EAjG5PkwEN6UddjvlTfMluN6soG302vMGV0r0KXunDJMRil-gMTNUweJWTiGT2t-e_oFWfGxFrAFmMiwmI6Muio`,
             'X-Manager-Token': 'eyJpdiI6IklhT1NGRURqbWE1bkN1Qkt3eFBQK2c9PSIsInZhbHVlIjoiTncvRWV4TzB5NC9jV1ZIUVlta1I4SDVXVUx6VWYvQWlNY3hLT01vZ3B5V2dkQTJ2cVk5ZTZtbmkxaE5kdzd4WjR0aHE4OTViQjVQRUx5eWUrT0prMTRmRHZFcFVQdis2RVR4OG9EK1F4NjRML3pZbG9RQ1BJRDVKZzFnUFhFSnpQMVZtbWI5UG5WUFRpL3c3Rm9yQnNxMEhtTGd3dVdyYkRtMjZWNnBGQW9qMEVuZUdULy9KY20wUS9HaWxmdmVHOC8rQWRRWnN2NHYxTWVqNmZ3WFN3VTgwSXdHNVB0clMxcnY4N3FLRlZuOD0iLCJtYWMiOiJmZDliODUyNjQ4YzM3NDM2ZTFmOWU4OWRiZmY2NWJlNDMwOGFhNzU4YTAxMjM1MDhkNWNlNDQ2N2MxNzgzNDI2IiwidGFnIjoiIn0='
             // 'X-Manager-Token': `${data.access_token}`,
         }

         console.log('headerdd',header)
        try {
            const response = await axios.get(url, {
                params: {
                    page: data.page,
                    per_page: data.per_page
                },
                // headers: {
                //     'Authorization': `Bearer ${data.token}`,
                //     // 'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzNTI0IiwianRpIjoiODQ3ZTMwYzY4YjJkNzc4ZmNmNjAwOGFkNTU2MzUzZjNhM2NlYWUzYjk5YmY3Mjk4MTM0YjNlNDQzMDY5OGU2NTkyYzUzNzk0MTVlOWM3NzYiLCJpYXQiOjE3MjY0NzA3NTIuMTYwMzgzLCJuYmYiOjE3MjY0NzA3NTIuMTYwMzg2LCJleHAiOjE3NTgwMDY3NTIuMTI0NDIyLCJzdWIiOiI2NDIzNDgiLCJzY29wZXMiOlsidGhpcmRfYWNjb3VudF9yZWFkIiwidGhpcmRfdmF0X3JlYWQiLCJ0aGlyZF9jYXRlZ29yaWVzX3JlYWQiLCJ0aGlyZF9jYXRlZ29yaWVzX3dyaXRlIiwidGhpcmRfY3VzdG9tZXJzX3JlYWQiLCJ0aGlyZF9jdXN0b21lcnNfd3JpdGUiLCJ0aGlyZF9vcmRlcl9yZWFkIiwidGhpcmRfb3JkZXJfd3JpdGUiLCJ0aGlyZF9jb3Vwb25zX3dyaXRlIiwidGhpcmRfZGVsaXZlcnlfb3B0aW9uc19yZWFkIiwidGhpcmRfZGVsaXZlcnlfb3B0aW9uc193cml0ZSIsInRoaXJkX2FiYW5kb25lZF9jYXJ0c19yZWFkIiwidGhpcmRfcGF5bWVudF9yZWFkIiwidGhpcmRfd2ViaG9va19yZWFkIiwidGhpcmRfcHJvZHVjdF9yZWFkIiwidGhpcmRfcHJvZHVjdF93cml0ZSIsInRoaXJkX2NvdW50cmllc19yZWFkIiwidGhpcmRfY2F0YWxvZ193cml0ZSIsInRoaXJkX3N1YnNjcmlwdGlvbl9yZWFkIiwidGhpcmRfaW52ZW50b3J5X3JlYWQiLCJ0aGlyZF9qc193cml0ZSIsInRoaXJkX2J1bmRsZV9vZmZlcnNfcmVhZCIsInRoaXJkX2NyZWF0ZV9vcmRlciIsInRoaXJkX3Byb2R1Y3Rfc3RvY2tfcmVhZCIsInRoaXJkX3Byb2R1Y3Rfc3RvY2tfd3JpdGUiLCJ0aGlyZF9pbnZlbnRvcnlfd3JpdGUiLCJlbWJlZGRlZF9hcHBzX3Rva2Vuc193cml0ZSIsInRoaXJkX2xveWFsdHlfcmVhZCIsInRoaXJkX2xveWFsdHlfd3JpdGUiLCJ0aGlyZF9vcmRlcl9yZXZlcnNlX3dyaXRlIiwidGhpcmRfb3JkZXJfcmV2ZXJzZV9yZWFkIl19.BjUzt1C9egY4Lk2zZo5YPoqIuCnROo3esCtkvQS79znaCSEvHv5dunEYk_Jk64d0M_t9_f6VZugtCgdB-inIF8VOlo3S_ry_cMXAFaN6LRXnf5GfbDMxzatTfUflik0WlJRhAToZzi7xkxUTNQ_za-Mj8xKo5kLllbRUFoNv-6fd4-n0nUOiBPAMjM94GJ2Z7yptqX_0kr5ougAo1OkdK4zGPiswd9659UXqbmkJi-zW13trMA64IhR3z8sbIYz8kdcZFw5VO1RgwhLIUwkNhWh893yomnFEphJ9n-_eyM2PgQMM8QdPnBFaocC9KCqU7XLnsmaepipTCEBn3F--FSE0quKoUr5j3rYNAGMIkvADmjCA0O448ebPSoW9QZcTkimJe4R5yO0ZLGz40N18tGXKmYSHLY4FzDUFRe3vABy8d7w5t8F4lBLvyG98nrTeWSSwkH1V0mosmQm4eDkOPoPeFMrFFzo8R1Ec3jkHx7zqGqvJFPYZnwTsdN_t9MKpytj66E4UDA-Dn9B2FD2JXfgyWGaryo76goJZplyDAPx4M6WenUjo8piHkVbMQQmPiDqcfrofXas130LSVYc1EAjG5PkwEN6UddjvlTfMluN6soG302vMGV0r0KXunDJMRil-gMTNUweJWTiGT2t-e_oFWfGxFrAFmMiwmI6Muio`,
                //     // 'X-Manager-Token': `eyJpdiI6IklhT1NGRURqbWE1bkN1Qkt3eFBQK2c9PSIsInZhbHVlIjoiTncvRWV4TzB5NC9jV1ZIUVlta1I4SDVXVUx6VWYvQWlNY3hLT01vZ3B5V2dkQTJ2cVk5ZTZtbmkxaE5kdzd4WjR0aHE4OTViQjVQRUx5eWUrT0prMTRmRHZFcFVQdis2RVR4OG9EK1F4NjRML3pZbG9RQ1BJRDVKZzFnUFhFSnpQMVZtbWI5UG5WUFRpL3c3Rm9yQnNxMEhtTGd3dVdyYkRtMjZWNnBGQW9qMEVuZUdULy9KY20wUS9HaWxmdmVHOC8rQWRRWnN2NHYxTWVqNmZ3WFN3VTgwSXdHNVB0clMxcnY4N3FLRlZuOD0iLCJtYWMiOiJmZDliODUyNjQ4YzM3NDM2ZTFmOWU4OWRiZmY2NWJlNDMwOGFhNzU4YTAxMjM1MDhkNWNlNDQ2N2MxNzgzNDI2IiwidGFnIjoiIn0=`,
                //     'X-Manager-Token': `${data.access_token}`,
                // }
                headers: header
            });

            console.log('res cus',response)
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async getOrders(data) {

        // console.log('gett cus',data)
        const url = "https://api.zid.sa/v1/managers/store/orders";

        try {
            const response = await axios.get(url, {
                params: {
                    page: data.page,
                    per_page: data.per_page,
                    payload_type: 'default'
                },
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'X-Manager-Token': `${data.access_token}`,
                }
            });

            console.log('res orders',response)
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
}
module.exports = new ZidApiService();
