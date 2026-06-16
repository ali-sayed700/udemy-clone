import { getSession } from "@/lib/session";
import NavbarClient from "./NavbarClient";

const Navbar = async () => {
  const session = await getSession();

  return <NavbarClient session={session} />;
};

export default Navbar;
