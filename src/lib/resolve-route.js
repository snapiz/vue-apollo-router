import mergeGraphQLTags from "./merge-graphql-tags";

export default function resolveRoute(context) {
  const {
    route,
    next,
    apollo: apolloClient,
    defaultQuery,
    beforeRender,
    params,
    history
  } = context;
  const { redirect, title, apollo } = route;
  const { search } = history.location;

  if (!title) {
    return next();
  }

  if (redirect) {
    return {
      redirect
    };
  }

  search &&
    search
      .substring(1)
      .split("&")
      .map(v => v.split("="))
      .forEach(([key, value]) => {
        params[key] = decodeURIComponent(value);
      });

  let componentPromise = route.component ? route.component : null;

  if (typeof componentPromise === "object") {
    componentPromise = Promise.resolve(componentPromise);
  } else if (typeof componentPromise === "function") {
    componentPromise = route.component().then(x => x.default);
  }

  if (apollo === false) {
    return componentPromise.then(component => {
      if (!component) {
        return next();
      }

      return { ...route, component, params };
    });
  }

  const promises = [componentPromise];

  if (!apollo && defaultQuery) {
    promises.push(
      apolloClient.query({
        fetchPolicy: "no-cache",
        ...defaultQuery
      })
    );
  } else if (apollo.query) {
    promises.push(
      apolloClient.query({
        fetchPolicy: "no-cache",
        ...apollo,
        query: mergeGraphQLTags(defaultQuery.query, apollo.query)
      })
    );
  } else if (apollo) {
    apollo.forEach(x => {
      const { $client, ...options } = x;
      const client = apolloClient.$clients[$client] || apolloClient;

      promises.push(
        client.query({
          fetchPolicy: "no-cache",
          ...options,
          query: mergeGraphQLTags(defaultQuery.query, x.query)
        })
      );
    });
  }

  return Promise.all(promises).then(([component, ...datas]) => {
    if (!component) {
      return next();
    }

    let data = null;

    if ((!apollo && defaultQuery) || apollo.query) {
      data = datas[0].data;
    } else if (apollo) {
      data = datas.map(x => x.data);
    }

    const renderData = { ...route, component, data, params };

    return (beforeRender && beforeRender(renderData)) || renderData;
  });
}
