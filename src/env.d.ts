/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: {
      username: string;
      roles: string[];
      name: string;
      restaurant: string;
    };
  }
}