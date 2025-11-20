import type { IExecuteFunctions, INodeProperties, IDataObject, IBinaryData } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { POST_FIELDS, CREDENTIAL_NAME } from '../../constants/apiFields';

const showOnlyForMediaUpload = {
	operation: ['upload'],
	resource: ['media'],
};

type UploadSession = {
	uploadUuid: string;
	uploadUrl: string;
	confirmUrl: string;
	headers: IDataObject | undefined;
	rawResponse: IDataObject;
};

const MIME_CODE_TO_INFO: Record<number, { mime: string; fileType: number }> = {
	1: { mime: 'image/jpeg', fileType: 1 },
	2: { mime: 'image/png', fileType: 1 },
	3: { mime: 'video/mp4', fileType: 2 },
	4: { mime: 'video/quicktime', fileType: 2 },
	5: { mime: 'application/pdf', fileType: 3 },
	6: { mime: 'image/svg+xml', fileType: 1 },
};

const MIME_STRING_TO_CODE = Object.entries(MIME_CODE_TO_INFO).reduce<Record<string, number>>(
	(acc, [code, info]) => {
		acc[info.mime] = Number(code);
		return acc;
	},
	{},
);

function asNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		if (!Number.isNaN(parsed)) {
			return parsed;
		}
	}
	return undefined;
}

function asString(value: unknown): string | undefined {
	if (typeof value === 'string' && value.trim() !== '') {
		return value.trim();
	}
	return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'string') {
		const lowered = value.trim().toLowerCase();
		if (lowered === 'true') {
			return true;
		}
		if (lowered === 'false') {
			return false;
		}
	}
	return undefined;
}

function resolveUploadMetadata(
	binaryData: IBinaryData,
	binaryBuffer: Uint8Array,
	overrides: IDataObject,
): {
	fileName: string;
	fileSize: number;
	height: number;
	width: number;
	mimeTypeCode: number;
	mimeTypeString: string;
	fileType: number;
	mediaLibraryUpload: boolean;
	previewImageUpload: boolean;
} {
	const defaultFileName = asString(binaryData.fileName) ?? 'upload';
	const overrideFileName =
		asString(overrides.fileName) ??
		asString(overrides.file_name);
	const fileName = overrideFileName ?? defaultFileName;

	const candidateMimeString =
		asString(overrides.mimeTypeString) ??
		asString(overrides.mimeType) ??
		asString(binaryData.mimeType);
	const overrideMimeCode = asNumber(overrides.mimeTypeCode);

	let mimeTypeCode = overrideMimeCode ?? (candidateMimeString ? MIME_STRING_TO_CODE[candidateMimeString] : undefined);
	let mimeTypeString = mimeTypeCode ? MIME_CODE_TO_INFO[mimeTypeCode]?.mime : undefined;

	if (!mimeTypeCode || !mimeTypeString) {
		mimeTypeCode = 1;
		mimeTypeString = MIME_CODE_TO_INFO[mimeTypeCode].mime;
	}

	const overrideFileType = asNumber(overrides.fileType);
	const fileType = overrideFileType ?? MIME_CODE_TO_INFO[mimeTypeCode].fileType;

	const overrideFileSize = asNumber(overrides.fileSize) ?? asNumber(overrides.fileSizeInBytes);
	const detectedFileSize = asNumber(binaryData.fileSize) ?? binaryBuffer.length;
	const fileSize = overrideFileSize ?? detectedFileSize;

	const overrideHeight = asNumber(overrides.fileHeight) ?? asNumber(overrides.height);
	const overrideWidth = asNumber(overrides.fileWidth) ?? asNumber(overrides.width);
	const detectedHeight = asNumber(binaryData.height) ?? 0;
	const detectedWidth = asNumber(binaryData.width) ?? 0;

	const height = overrideHeight ?? detectedHeight;
	const width = overrideWidth ?? detectedWidth;

	const mediaLibraryUpload =
		asBoolean(overrides.mediaLibraryUpload) ?? asBoolean(overrides.media_library_upload) ?? true;
	const previewImageUpload =
		asBoolean(overrides.previewImageUpload) ?? asBoolean(overrides.preview_image_upload) ?? false;

	return {
		fileName,
		fileSize,
		height,
		width,
		mimeTypeCode,
		mimeTypeString,
		fileType,
		mediaLibraryUpload,
		previewImageUpload,
	};
}

function normalizeSignedHeaders(
	rawHeaders: IDataObject | undefined,
	fallbackMimeType: string,
	fileSize: number,
): IDataObject {
	const normalized: IDataObject = {};

	if (rawHeaders) {
		for (const [key, value] of Object.entries(rawHeaders)) {
			normalized[key] = String(value);
		}
	}

	const signedContentType =
		rawHeaders?.['Content-Type'] ??
		rawHeaders?.['content-type'] ??
		rawHeaders?.['x-goog-meta-content-type'];

	normalized['Content-Type'] = signedContentType
		? String(signedContentType)
		: fallbackMimeType;
	normalized['Content-Length'] = fileSize.toString();

	return normalized;
}

async function initiateUploadSession(
	context: IExecuteFunctions,
	body: IDataObject,
): Promise<UploadSession> {
	const response = (await context.helpers.httpRequestWithAuthentication.call(context, CREDENTIAL_NAME, {
		method: 'POST',
		url: buildUrl(ENDPOINTS.MEDIA),
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	})) as IDataObject;

	return {
		uploadUuid: (response.uuid as string) ?? '',
		uploadUrl: (response.url as string) ?? '',
		confirmUrl: (response.confirm_url as string) ?? '',
		headers: response.headers as IDataObject | undefined,
		rawResponse: response,
	};
}

async function uploadBinaryToSignedUrl(
	context: IExecuteFunctions,
	session: UploadSession,
	headers: IDataObject,
	fileContents: Uint8Array,
): Promise<void> {
	await context.helpers.httpRequest({
		method: 'PUT',
		url: session.uploadUrl,
		headers,
		body: fileContents,
	});
}

async function confirmUpload(context: IExecuteFunctions, confirmUrl: string): Promise<void> {
	await context.helpers.httpRequestWithAuthentication.call(context, CREDENTIAL_NAME, {
		method: 'PUT',
		url: confirmUrl,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: {
			success: true,
		},
		json: true,
	});
}

export async function executeMediaUpload(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	// Get parameters
	const profileGroupUuid = this.getNodeParameter('profileGroupUuid', i) as string;
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

	// Get additional fields
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

	const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
	const binaryBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	const metadata = resolveUploadMetadata(binaryData, binaryBuffer, additionalFields);

	const step1RequestBody = {
		[POST_FIELDS.PROFILE_GROUP]: profileGroupUuid,
		filename: metadata.fileName,
		content_type: metadata.mimeTypeCode,
		filesize_in_bytes: metadata.fileSize,
		height: metadata.height,
		width: metadata.width,
		file_type: metadata.fileType,
		media_library_upload: metadata.mediaLibraryUpload,
		preview_image_upload: metadata.previewImageUpload,
	};

	const session = await initiateUploadSession(this, step1RequestBody);
	const headersForUpload = normalizeSignedHeaders(
		session.headers,
		metadata.mimeTypeString,
		binaryBuffer.length,
	);

	await uploadBinaryToSignedUrl(this, session, headersForUpload, binaryBuffer);
	await confirmUpload(this, session.confirmUrl);

	// Return the upload result
	return [
		{
			media_uuid: session.uploadUuid,
			success: true,
		},
	];
}

export const mediaUploadDescription: INodeProperties[] = [
	{
		displayName: 'Profile Group UUID',
		name: 'profileGroupUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForMediaUpload,
		},
		default: '',
		description: 'UUID of the target profile group',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForMediaUpload,
		},
		default: 'data',
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForMediaUpload,
		},
		options: [
			{
				displayName: 'Custom File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description: 'Override the detected file name',
			},
			{
				displayName: 'File Size (Bytes)',
				name: 'fileSize',
				type: 'number',
				default: 0,
				description: 'Override the detected file size',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'File Type',
				name: 'fileType',
				type: 'options',
				options: [
					{
						name: 'Image',
						value: 1,
					},
					{
						name: 'Video',
						value: 2,
					},
					{
						name: 'PDF',
						value: 3,
					},
				],
				default: 1,
				description: 'Override the detected file type',
			},
			{
				displayName: 'Height (Px)',
				name: 'fileHeight',
				type: 'number',
				default: 0,
				description: 'Override the detected height in pixels',
			},
			{
				displayName: 'Media Library Upload',
				name: 'mediaLibraryUpload',
				type: 'boolean',
				default: true,
				description: 'Whether to store the asset in the Lomavis media library',
			},
			{
				displayName: 'MIME Type (Code)',
				name: 'mimeTypeCode',
				type: 'options',
				options: [
					{
						name: '1 - Image (JPEG)',
						value: 1,
					},
					{
						name: '2 - Image (PNG)',
						value: 2,
					},
					{
						name: '3 - Video (MP4)',
						value: 3,
					},
					{
						name: '4 - Video (QuickTime)',
						value: 4,
					},
					{
						name: '5 - Application (PDF)',
						value: 5,
					},
					{
						name: '6 - Image (SVG)',
						value: 6,
					},
				],
				default: 1,
				description: 'Override the detected MIME type using Lomavis numeric codes',
			},
			{
				displayName: 'Preview Image Upload',
				name: 'previewImageUpload',
				type: 'boolean',
				default: false,
				description: 'Whether to flag the upload as preview-only',
			},
			{
				displayName: 'Width (Px)',
				name: 'fileWidth',
				type: 'number',
				default: 0,
				description: 'Override the detected width in pixels',
			},
		],
	},
];
