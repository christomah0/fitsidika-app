import { Route } from "expo-router";

interface MenuItem {
  name: string;
  icon: string;
  route: Route;
}

export const MENU_ITEMS: MenuItem[] = [
  { name: 'Symptôme', icon: 'doc.text', route: '(tabs)/(accueil)/symptoms' as Route },
  { name: 'Plan de Soins', icon: 'list.bullet.clipboard', route: '(tabs)/(accueil)/plan' as Route },
  { name: 'Objectifs', icon: 'target', route: '(tabs)/(accueil)/goals' as Route },
];
