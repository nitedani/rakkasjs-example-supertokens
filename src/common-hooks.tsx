import { MantineProvider } from "@mantine/core";
import type { CommonHooks } from "rakkasjs";

const hooks: CommonHooks = {
  wrapApp(app) {
    return (
      <MantineProvider withGlobalStyles withNormalizeCSS>
        {app}
      </MantineProvider>
    );
  },
};

export default hooks;
