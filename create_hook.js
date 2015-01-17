// POST /repos/FabioFleitas/:repo/hooks
// https://developer.github.com/v3/repos/hooks/#create-a-hook
{
  "name": "Github Todo",
  "active": true,
  "config": {
    "url": "/",
    "content_type": "json",
    "insecure_ssl": "1", // ssl verification not performed
  },
  "events": [
    "push",
  ],
}
