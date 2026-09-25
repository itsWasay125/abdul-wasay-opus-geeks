import usePageEffects from "../hooks/usePageEffects";
import useAnimationBudget from "../hooks/useAnimationBudget";

export default function ScrollProvider({ children }) {
  usePageEffects();
  useAnimationBudget();
  return children;
}
