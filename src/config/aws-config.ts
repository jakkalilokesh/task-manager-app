// src/aws-config.ts
import { Amplify } from 'aws-amplify';

// You can also rename this to `aws-exports.ts` for standard Amplify compatibility
const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
    mandatorySignIn: true, // 🔒 secure default
  },
  API: {
    endpoints: [
      {
        name: 'TasksAPI',
        endpoint: process.env.REACT_APP_API_GATEWAY_URL || '',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      }
    ]
  },
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_ATTACHMENTS_BUCKET || '',
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    }
  }
};

Amplify.configure(awsConfig);

export default awsConfig;
