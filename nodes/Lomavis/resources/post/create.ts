import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { POST_STATUS } from '../../constants/postStatuses';
import { CREDENTIAL_NAME } from '../../constants/apiFields';
import { PLATFORM_OPTIONS } from '../../constants/platforms';
import { buildPostBody, extractMediaUuids } from '../../helpers/requestBuilders';

const showOnlyForPostCreate = {
	operation: ['create'],
	resource: ['post'],
};

export async function executePostCreate(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject[]> {
	// Gather parameters
	const profileGroupUuid = this.getNodeParameter('profileGroupUuid', i) as string;
	const text = this.getNodeParameter('text', i) as string;
	const postStatus = this.getNodeParameter('postStatus', i) as number;
	const platforms = this.getNodeParameter('platformConfiguration', i) as string[];
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

	// Extract media UUIDs if provided
	const mediaCollection = additionalFields.mediaCollection as IDataObject | undefined;
	const mediaUuids = mediaCollection ? extractMediaUuids(mediaCollection) : [];

	// Build post body using helper function
	const body = buildPostBody({
		profileGroupUuid,
		text,
		postStatus,
		platforms,
		mediaUuids,
		plannedPublicationDatetime: additionalFields.plannedPublicationDateTime as string | undefined,
		videoThumbnailUuid: additionalFields.videoThumbnailUuid as string | undefined,
		linkedinDocumentTitle: additionalFields.linkedinDocumentTitle as string | undefined,
		customMetadata: additionalFields.customMetadataJson as string | undefined,
	});

	const responseData = (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL_NAME, {
		method: 'POST',
		url: buildUrl(ENDPOINTS.POSTS),
		qs: {
			omitEmpty: true,
		},
		body,
		json: true,
	})) as IDataObject;

	return [responseData];
}

export const postCreateDescription: INodeProperties[] = [
	{
		displayName: 'Profile Group UUID',
		name: 'profileGroupUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForPostCreate,
		},
		default: '',
		description: 'UUID of the profile group where the post will be published',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: showOnlyForPostCreate,
		},
		default: '',
		description: 'Content of the post',
	},
	{
		displayName: 'Post Status',
		name: 'postStatus',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForPostCreate,
		},
		options: [
			{
				name: 'Draft',
				value: POST_STATUS.DRAFT,
			},
			{
				name: 'Ready',
				value: POST_STATUS.READY,
			},
		],
		default: POST_STATUS.DRAFT,
		description: 'Status to assign to the newly created post',
	},
	{
		displayName: 'Platforms',
		name: 'platformConfiguration',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: showOnlyForPostCreate,
		},
		options: [...PLATFORM_OPTIONS],
		default: [],
		description: 'Select the platforms where the post should be published',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForPostCreate,
		},
		options: [
			{
				displayName: 'Custom Metadata',
				name: 'customMetadataJson',
				type: 'json',
				default: '',
				description: 'Optional custom metadata payload as JSON',
			},
			{
				displayName: 'LinkedIn Document Title',
				name: 'linkedinDocumentTitle',
				type: 'string',
				default: '',
				description: 'Document title required when posting documents to LinkedIn',
			},
			{
				displayName: 'Media',
				name: 'mediaCollection',
				type: 'fixedCollection',
				placeholder: 'Add Media',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Media',
						name: 'media',
						values: [
							{
								displayName: 'Media UUID',
								name: 'uuid',
								type: 'string',
								default: '',
								description: 'UUID of the uploaded media',
							},
						],
					},
				],
			},
			{
				displayName: 'Planned Publication Date/Time',
				name: 'plannedPublicationDateTime',
				type: 'dateTime',
				default: '',
				description: 'Schedule when the post should be published',
			},
			{
				displayName: 'Video Thumbnail UUID',
				name: 'videoThumbnailUuid',
				type: 'string',
				default: '',
				description: 'UUID of the media to use as a video thumbnail',
			},
		],
	},
];
