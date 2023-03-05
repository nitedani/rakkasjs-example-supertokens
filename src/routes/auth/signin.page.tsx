import { Box, Button, Group, TextInput } from "@mantine/core";
import { Link, navigate } from "rakkasjs";
import { useForm } from "react-hook-form";
import { useAuth } from "src/lib/auth";

export default () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
  }>();

  const { signIn } = useAuth();
  return (
    <Box sx={{ maxWidth: 300 }} mx="auto">
      <h1>Sign In</h1>
      <form
        onSubmit={handleSubmit(async (data) => {
          const res = await signIn({
            email: data.email,
            password: data.password,
          });

          if (res.status === "OK") {
            navigate("/");
          } else {
            setError("root", {
              message: "Invalid email or password",
            });
          }
        })}
      >
        <TextInput withAsterisk label="Email" {...register("email")} />

        <TextInput
          withAsterisk
          label="Password"
          type="password"
          {...register("password")}
        />

        <Group position="right" mt="md">
          <Link href="/auth/signup">Sign Up</Link>
          <Button type="submit">Submit</Button>
        </Group>

        {errors.root && (
          <Box
            sx={{
              color: "red",
            }}
          >
            {errors.root.message}
          </Box>
        )}
      </form>
    </Box>
  );
};
