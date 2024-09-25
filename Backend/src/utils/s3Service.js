//Backend/src/utils/s3Service.js
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

export const uploadFileToS3 = async (file, bucketName) => {
    const params = {
        Bucket: bucketName,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };
    console.log('File buffer:', file.buffer);
    try {
        const { Location, Key } = await s3.upload(params).promise();
        console.log(`File successfully uploaded to S3 at ${Location}`);
        return { url: Location, key: Key };
    } catch (error) {
        console.error('Failed to upload file to S3:', error);
        throw error;
    }
};

export const deleteFileFromS3 = async (key, bucketName) => {
    const params = {
        Bucket: bucketName,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
        console.log('File successfully deleted from S3');
    } catch (error) {
        console.error('Failed to delete file from S3:', error);
        throw error;
    }
};
