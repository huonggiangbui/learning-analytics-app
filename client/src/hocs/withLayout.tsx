import { ReactElement } from "react";
import { useAuthState } from "../contexts/auth";
import UserLayout from "../layouts/User";
import GuestLayout from "../layouts/Guest";

interface Props {}

export default function withLayout<P extends object>(
  Comp: React.ComponentType<P>
): (props: Props) => JSX.Element {
  return (props): ReactElement => {
    const { user, loading } = useAuthState();

    if (loading) {
      // TODO use loading layout instead
      return (
        <GuestLayout>
          <Comp {...(props as P)} />
        </GuestLayout>
      );
    }

    if (user) {
      return (
        <UserLayout>
          <Comp {...(props as P)} />
        </UserLayout>
      );
    }

    return (
      <GuestLayout>
        <Comp {...(props as P)} />
      </GuestLayout>
    );
  };
}
