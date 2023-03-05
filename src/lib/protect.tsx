import { ComponentType } from "react";
import { useAuth } from "./auth";

export function protect<T extends object = {}>(
  Component: ComponentType<T>,
  Fallback: React.FC<T> | string = "",
  props: Omit<Parameters<typeof Protected>[0], "children"> = {}
) {
  const ComponentWithProtection = (componentProps: T) => {
    return (
      <Protected
        {...props}
        fallback={
          typeof Fallback === "string" ? (
            Fallback
          ) : (
            <Fallback {...componentProps} />
          )
        }
      >
        <Component {...componentProps} />
      </Protected>
    );
  };
  ComponentWithProtection.displayName = `protect(${
    Component.displayName || Component.name
  })`;
  return ComponentWithProtection;
}

export const Protected = ({
  children,
  disableRedirect = false,
  permissions,
  fallback = <></>,
}: {
  disableRedirect?: boolean;
  children: React.ReactNode;
  permissions?: string[];
  fallback?: React.ReactNode;
}) => {
  const { data: session } = useAuth({
    disableRedirect,
  });

  const hasPermission =
    !permissions ||
    (session.permissions &&
      permissions.every((permission) =>
        session.permissions!.includes(permission)
      ));

  if (session.valid && hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
