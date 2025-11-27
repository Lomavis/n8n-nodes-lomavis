import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { executeCompetitorList } from './resources/competitor';
import { executeProfileGroupList, executeProfileGroupSearch } from './resources/profileGroup';
import { executePostCreate, executePostCreateDraftAndSendApproval, executePostDelete, executePostListByStatus, executePostSendApproval } from './resources/post';
import { executeMediaUpload } from './resources/media';

// Type definition for operation functions
export type OperationFunction = (
	this: IExecuteFunctions,
	i: number,
) => Promise<IDataObject[]>;

// Centralized operation map
// Key format: "{resource}_{operation}"
export const operationMap: Record<string, OperationFunction> = {
	// Competitor operations
	competitor_list: executeCompetitorList,

	// Profile Group operations
	profileGroup_list: executeProfileGroupList,
	profileGroup_search: executeProfileGroupSearch,

	// Post operations
	post_create: executePostCreate,
	post_createDraftAndSendApproval: executePostCreateDraftAndSendApproval,
	post_delete: executePostDelete,
	post_listByStatus: executePostListByStatus,
	post_sendApproval: executePostSendApproval,

	// Media operations
	media_upload: executeMediaUpload,
};
