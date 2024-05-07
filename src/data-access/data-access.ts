import client from "@/components/graphql/client/client"
import { gql } from "@apollo/client"
import { DocumentNode } from "graphql"
import { apiObjectFromDto } from "../dto/fromDto";



class DataAccess {

    constructor() {

    }


    public async getGQLData(query: DocumentNode, variables?: any) {
        try {
            const response = await client.query({
                query,
                variables,
                fetchPolicy: "network-only",
            });

            if (successStatusCode(response.networkStatus)) {
                return response
            } else {
                throw new Error(`Server error: ${response.networkStatus}`)
            }
        } catch (e) {
            throw new Error(`Server not responding`)
        }
    }

    private async getQueries(sceneId: number) {

        const query = gql`
        query GetScene($sceneId: Int!) {
          appv3_scene_by_pk(id: $sceneId) {
              queries {
                id
                endpoint
              }
            }
          }
        `;

        const variables = {
            sceneId: sceneId,
        };

        const response = await this.getGQLData(query, variables)
        const queries = response.data.appv3_scene_by_pk.queries as any[];
        const x = queries.map(x => apiObjectFromDto(x))

        return x
    }
}



export const successStatusCode = (code: number) => code >= 200 && code < 300
