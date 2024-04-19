import { createContext, useContext, useEffect, useState } from "react";
import ApiHandler, { ApiObjectsMap } from "./api-service";
import { useMutation, useQuery } from "@apollo/client";

import { useRouter } from "next/router";
import { useViewer } from "@/viewer/viewer-component";
import { ApiUseQuery } from "./api-service.types";
import { ADD_QUERY_MUTATION, GET_QUERIES, UPDATE_QUERY_MUTATION } from "./queries";

export const ApiHandlerContext = createContext<ApiHandler | undefined>(
  undefined
);

interface ApiHandlerComponentProps {
  children: React.ReactNode;
}

export const useApiHandler = () => {
  const context = useContext(ApiHandlerContext);
  return context!;
};

export const useApiObjects = (): ApiObjectsMap => {
  const apiHandler = useApiHandler();

  const [apiObjects, setApiObjects] = useState<ApiObjectsMap>(new Map());

  useEffect(() => {
    if (apiHandler) {
      setApiObjects(apiHandler.apiObjects);

      const apiObjectsSubscription = apiHandler.$apiObjects.subscribe(
        (apiObjects) => setApiObjects(new Map(apiObjects))
      );

      return () => {
        apiObjectsSubscription.unsubscribe();
      };
    }
  }, [apiHandler]);

  return apiObjects;
};

function ApiHandlerComponent(props: ApiHandlerComponentProps) {
  const viewer = useViewer();

  const [apiHandler, _] = useState(() => new ApiHandler(viewer));

  const router = useRouter();
  const { scene_id } = router.query;

  const queryOptions = { variables: { scene_id } };
  const { data, loading, error, refetch }: ApiUseQuery = useQuery(
    GET_QUERIES,
    queryOptions
  );

  /* data provider */
  useEffect(() => {
    if (data && apiHandler) {
      apiHandler.update(data.app_queries, refetch);
    }
  }, [data, apiHandler]);

  /* add and mutate */
  const [addQuery] = useMutation(ADD_QUERY_MUTATION);
  const [updateQuery] = useMutation(UPDATE_QUERY_MUTATION);

  useEffect(() => {
    if (apiHandler) {
      apiHandler.provideAddUpdate(addQuery, updateQuery);
    }
  }, []);

  useEffect(() => {
    return () => apiHandler.dispose();
  }, []);

  return (
    <>
      <ApiHandlerContext.Provider value={apiHandler}>
        {props.children}
      </ApiHandlerContext.Provider>
    </>
  );
}



export default ApiHandlerComponent;
