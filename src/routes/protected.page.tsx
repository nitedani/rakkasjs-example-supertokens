import { protect } from "src/lib/protect";

export default protect(() => {
  return <h1>Protected page</h1>;
});
