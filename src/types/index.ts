// Centralized types for the system
// All interfaces are defined and exported from this file


export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IRole {
  _id: string;
  name: string;
  slug: string;
}

export interface IPermission {
  _id: string;
  name: string;
  slug: string;
}

export interface IEvent {
  _id: string;
  description: string;
}

export interface IPost {
  _id: string;
  title: string;
  content: string;
  author?: { _id: string; name: string } | string;
  createdAt?: string;
  updatedAt?: string;
}
