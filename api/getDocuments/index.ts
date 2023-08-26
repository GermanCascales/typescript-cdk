import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda'
import { S3 } from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.DOCUMENTS_BUCKET_NAME;

export const getDocuments = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log(`Bucket name: ${bucketName}`);
    
    try {
        const { Contents: results } = await s3.listObjects({ Bucket: process.env.DOCUMENTS_BUCKET_NAME! }).promise();
        const documents = await Promise.all(results!.map(async (result) => generateSignedURL(result)))

        return {
            statusCode: 200,
            body: JSON.stringify(documents)
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        }
    }
}

const generateSignedURL = async (result: S3.Object): Promise<{ name: string, url: string }> => {
    const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: result.Key!,
        Expires: 60 * 5 // 5 minutes
    });

    return {
        name: result.Key!,
        url
    }
}