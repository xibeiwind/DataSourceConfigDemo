export interface IAppError {
  errorCode: ErrorCode,
  message: any,
  title: string,
}

export class AppError extends Error implements IAppError {
  errorCode: ErrorCode;
  message: string;
  title: string;

  constructor(errorCode: ErrorCode, message: string, title: string = null) {
    super(message);
    this.errorCode = errorCode;
    this.message = message;
    this.title = title;
  }
}

export enum ErrorCode {
  // Note that the value of the enum is in camelCase while
  // the enum key is in Pascal casing
  Unknown = "unknown",
  GenericRenderError = "genericRenderError",
  ProjectInvalidJson = "projectInvalidJson",
  ProjectInvalidSecurityToken = "projectInvalidSecurityToken",
  ProjectDuplicateName = "projectDuplicateName",
  SecurityTokenNotFound = "securityTokenNotFound",
  OverloadedKeyBinding = "overloadedKeyBinding",
  BlobContainerIONotFound = "blobContainerIONotFound",
  BlobContainerIOForbidden = "blobContainerIOForbidden",
  PredictWithoutTrainForbidden = "predictWithoutTrainForbidden",
  ModelNotFound = "modelNotFound",
  ModelCountLimitExceeded = "modelCountLimitExceeded",
  HttpStatusUnauthorized = "unauthorized",
  HttpStatusNotFound = "notFound",
  HttpStatusTooManyRequests = "tooManyRequests",
  RequestSendError = "requestSendError",
  ProjectUploadError = "ProjectUploadError",
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IRect extends IPoint, ISize {
}

export interface ISize {
  w: number;
  h: number;
}

export interface IEndPoint {
  point: IPoint;
  control: IPoint;
}

export interface IBezier {
  start: IEndPoint;
  end: IEndPoint;
}

export interface IFieldConnection {
  id: string;

  sourceId: string;
  targetId: string;
  cs: IPoint;
  ct: IPoint;
}

export interface IDataField {
  name: string;
  title?: string;
  id: string;
}



export interface IDataSource {
  id: string;

  name: string;
  title?: string;

  fields: IDataField[];
  offset: IPoint;
}

export interface IDataFlowChart {
  sources: IDataSource[];
  connections: IFieldConnection[];
}