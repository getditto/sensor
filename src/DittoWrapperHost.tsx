import { DittoProvider } from "@dittolive/react-ditto";
import { Ditto, Logger } from "@dittolive/ditto";
import App from "./App";

const createDittoInstance = () => {
  
  Logger.minimumLogLevel = 'Verbose'
  
  const ditto = new Ditto(
    {
      type: "onlinePlayground",
      token: "26aba87c-25bd-45c8-b46a-eb2f58a695b7",
      appID: "c420d141-9c4d-4a52-8770-03bf02d43330",
    }
  );  
  return ditto
};

function DittoWrapperHost() {
  return (
    <DittoProvider setup={createDittoInstance}>
      {({ loading, error }) => {
        if (loading) return <span>Loading Ditto...</span>;
        if (error)
          return (
            <span>
              There was an error loading Ditto. Error: {error.toString()}
            </span>
          );
        return <App />;
      }}
    </DittoProvider>
  );
}

export default DittoWrapperHost;
