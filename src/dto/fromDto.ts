
interface QueryObject {
    id: string,
    endpoint: string
}

export const apiObjectFromDto = (data: any): QueryObject => {
    const queryObject: QueryObject = {
        id: data.id,
        endpoint: data.endpoint
    }

    return queryObject

}