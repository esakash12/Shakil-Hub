import { redirect } from "next/navigation";

export const metadata = {
  title: "Mehedi Hasan Sakil | Founder & Creative Director",
  description: "About Mehedi Hasan Sakil - Founder & CEO at Sakil Hub, Content Manager at Canvasbag & Chinatown BD.",
};

export default function AboutPage() {
  redirect("/#about-founder");
}

