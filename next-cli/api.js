//create client, request path, paginate

function createClient({ baseUrl, token }) {
  async function request(path, params = {}) {
    const url = new URL(`/api/v1${path}`, baseUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: { Authorization: 'Bearer' + token},
    });

    if (!response.ok) {
      throw new Error(`Canvas API ${response.status}: ${path}` );
    }
    return response; 
  }

  async function paginate(path, params = {}) {
    let results = [];
    let next = null;

    let response = await request(path, {...params, per_page: 100});
    results = results.concat(await response.json());

    while ((next = getNextLink(response.headers.get('link')))) {
      response = await fetch(next, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Canvas API ${response.status}`);
      results = results.concat(await response.json());
    }
    return results;
  }

  return { request, paginate };
}

// canvas pagination needs next link header of the response to know if there is next page so raw json
function getNextLink(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/); 
  return match ? match[1] : null;
}

module.exports = {createClient};

