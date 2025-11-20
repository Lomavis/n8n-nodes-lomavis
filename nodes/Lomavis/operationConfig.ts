import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { executeProfileGroupList } from './resources/profileGroup';
import { executePostCreate, executePostCreateDraftAndSendApproval, executePostDelete, executePostListByStatus } from './resources/post';
import { executeMediaUpload } from './resources/media';

// Type definition for operation functions
export type OperationFunction = (
	this: IExecuteFunctions,
	i: number,
) => Promise<IDataObject[]>;

// Centralized operation map
// Key format: "{resource}_{operation}"
export const operationMap: Record<string, OperationFunction> = {
	// Profile Group operations
	profileGroup_list: executeProfileGroupList,

	// Post operations
	post_create: executePostCreate,
	post_createDraftAndSendApproval: executePostCreateDraftAndSendApproval,
	post_delete: executePostDelete,
	post_listByStatus: executePostListByStatus,

	// Media operations
	media_upload: executeMediaUpload,
};
