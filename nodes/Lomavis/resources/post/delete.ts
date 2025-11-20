import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { buildUrl, ENDPOINTS } from '../../constants/endpoints';
import { CREDENTIAL_NAME } from '../../constants/apiFields';

const showOnlyForPostDelete = {
  operation: ['delete'],
  resource: ['post'],
};

export async function executePostDelete(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject[]> {
  const uuid = this.getNodeParameter('uuid', i) as string;

  const responseData = (await this.helpers.httpRequestWithAuthentication.call(
    this,
    CREDENTIAL_NAME,
    {
      method: 'DELETE',
      url: buildUrl(ENDPOINTS.POST_BY_UUID(uuid)),
    },
  )) as IDataObject;

  return [responseData];
}

export const postDeleteDescription: INodeProperties[] = [
  {
    displayName: 'Post UUID',
    name: 'uuid',
    type: 'string',
    required: true,
    displayOptions: {
      show: showOnlyForPostDelete,
    },
    default: '',
    description: 'UUID of the post to delete',
    
  },
];
