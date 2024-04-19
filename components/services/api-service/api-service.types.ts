export interface ApiUseQuery {
    data: ApiData | undefined;
    [key: string]: any;
}

export interface ApiEntryBody {
    endpoint: string;
    query: string;
}

export type ApiGqlType = "gql" | "GRAPHQL";
export type ApiRestType = "controlPoints" | "restScene" | "rest" | "REST";

export type ApiType = ApiGqlType | ApiRestType;

export type ApiUpdateType = "metadata" | "entire";

export interface ApiQueryDependecy {
    dependent_query_id: string;
    id: string;
    main_query_id: string;
}

export interface ApiEntry {
    author_id: string;
    body: ApiEntryBody;
    created_at: string;
    id: string;
    index: number;
    scene_id: string;
    title: string;
    type: ApiType;
    updated_at: string;
    update_author_id: string;
    update_type: ApiUpdateType;
    query_dependencies: ApiQueryDependecy[];
    [key: string]: any;
}

export type ApiEntryStatus = "idle" | "loading" | "success" | "error";

interface ApiData {
    app_queries: ApiEntry[];
}