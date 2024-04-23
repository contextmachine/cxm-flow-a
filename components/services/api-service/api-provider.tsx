import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import { useRouter } from "next/router";
import { useViewer } from "@/viewer/viewer-component";
import ApiHandler, { ApiObjectsMap } from "@/src/viewer/loader/api-service";
import { ApiUseQuery } from "@/src/viewer/loader/objects/api-service.types";
import { ADD_QUERY_MUTATION, GET_QUERIES, UPDATE_QUERY_MUTATION } from "@/src/viewer/loader/queries";

export const ApiHandlerContext = createContext<ApiHandler | undefined>(
  undefined
);

interface ApiHandlerComponentProps {
  children: React.ReactNode;
}





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
