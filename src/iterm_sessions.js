function run(argv) {
  const iTerm = Application('iTerm');

  function getSessionInfoList() {
    const sessionInfoList = [];

    try {
      iTerm.windows().forEach(window => {
        window.tabs().forEach(tab => {
          tab.sessions().forEach(session => {
            sessionInfoList.push({
              id: session.id(),
              name: session.name(),
              tty: session.tty(),
              isProcessing: session.isProcessing(),
              profileName: session.profileName()
            });
          });
        });
      });
    } catch (e) {
      // If iTerm is not running, an error will be thrown.
      // Return an empty list in that case.
      return [];
    }

    return sessionInfoList;
  }

  return JSON.stringify(getSessionInfoList(), null, 2);
}
