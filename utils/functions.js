
/**
 * Standart wrapper for a router route that catches errors and returns standardized reply on them
 *
 * ## Usage
 * ```js
 * router.get("/programs", (req, res) => {
 *    executeAsyncRoute(
 *    // pass the res object for error handling
 *    res,
 *    // async callback. Put any logic within it and use res object to send the response back to frontend
 *    async () => {
 *       res.json( await someAsyncFunction() )
 *      // all errors within the callback are catched and dealt with by the wrapper, which will send the thrown error to frontend with corresponding response code
 *    },
 *    // route title for errors handling
 *    "Programs list")
 * })
 * ```
 *
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} callback whatever async code to execute
 * @param {*} routeName to be used in route identification in case of unknown error
 * @returns
 */
const executeAsyncRoute = async (res, callback, routeName = "route") => {
  try {
    await callback();
  } catch (e) {
    console.debug("executeAsyncRoute caught: ", e);
    if (e.name === "Error") {
      console.error(`${routeName} error:`, e);
      res.status(500).send("Unknown error");
      return;
    }
    res.status(400).send(e.message);
  }
};

module.exports = {executeAsyncRoute}