"use client";
import React, { useState } from "react";
import { Client, Databases } from "appwrite";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";

// TypeScript interface for the medicine state
interface Medicine {
  name: string;
  description: string;
  price: string;
  quantity: string;
  threshold: string;
}

export const AddMedicine = () => {
  const [medicine, setMedicine] = useState<Medicine>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    threshold: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // Use environment variable
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); // Use environment variable

  const databases = new Databases(client);

  // Handle Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate Input values
    if (!medicine.name || !medicine.description || !medicine.price || !medicine.quantity || !medicine.threshold) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const payload = {
        name: medicine.name,
        description: medicine.description,
        price: parseFloat(medicine.price),
        quantity: parseInt(medicine.quantity),
        threshold: parseInt(medicine.threshold),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Request payload:', payload); // Log the request payload

      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MEDICINE_COLLECTION_ID!,
        'unique()', // Generate a unique ID for the document
        payload
      );

      console.log('Response:', response); // Log the response for debugging

      setSuccess('Medicine added successfully!');
      setMedicine({
        name: '',
        description: '',
        price: '',
        quantity: '',
        threshold: '',
      });
      setError(null); // Clear any previous error messages
    } catch (err) {
      console.error('Error details:', err); // Log detailed error information
      setError('Failed to add medicine. Please try again.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Add Medicine
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Fill in the details below to add a new medicine to the inventory.
      </p>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={medicine.name} onChange={handleChange} placeholder="Medicine Name" type="text" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" value={medicine.description} onChange={handleChange} placeholder="Medicine Description" type="text" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" value={medicine.price} onChange={handleChange} placeholder="0.00" type="number" step="0.01" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" value={medicine.quantity} onChange={handleChange} placeholder="0" type="number" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="threshold">Medicine Per Day</Label>
          <Input id="threshold" name="threshold" value={medicine.threshold} onChange={handleChange} placeholder="0" type="number" />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Add Medicine &rarr;
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default AddMedicine;
