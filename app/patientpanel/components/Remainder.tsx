"use client";
import React, { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";
import { loadStripe } from "@stripe/stripe-js";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

import { ToastAction } from "@/components/ui/toast";
const MedicationReminder: React.FC = () => {
  const [reminders, setReminders] = useState<{ time: string; days: number }[]>(
    []
  );
  const [activeUtterance, setActiveUtterance] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("+919025850534"); // Set your default phone number here
  const [medicines, setMedicines] = useState<any[]>([]);
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );
  const { toast } = useToast();

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
  const databases = new Databases(client);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (reminders.length > 0) {
      reminders.forEach((reminder) => {
        const [hours, minutes] = reminder.time.split(":").map(Number);
        const now = new Date();
        const reminderTime = new Date(now.getTime());
        reminderTime.setHours(hours, minutes, 0, 0);

        if (reminderTime <= now) {
          reminderTime.setDate(reminderTime.getDate() + reminder.days);
        }

        const timeout = reminderTime.getTime() - now.getTime();
        if (timeout > 0) {
          const id = setTimeout(() => {
            playReminderSound();
            setReminders((prevReminders) =>
              prevReminders.filter((r) => r !== reminder)
            );
          }, timeout);

          setIntervalId((prevIntervalId) => {
            if (prevIntervalId) {
              clearInterval(prevIntervalId);
            }
            return id;
          });
        }
      });
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [reminders]);

  const fetchMedicines = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        process.env.NEXT_PUBLIC_APPWRITE_MEDICINE_COLLECTION_ID as string
      );
      setMedicines(response.documents);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

  const playReminderSound = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Time to take your medication!"
      );
      window.speechSynthesis.speak(utterance);
      setActiveUtterance(utterance);
    } else {
      console.warn("SpeechSynthesis API is not supported in this browser.");
    }
  };

  const handleStopReminder = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    if (activeUtterance) {
      window.speechSynthesis.cancel();
      setActiveUtterance(null);
    }

    try {
      const response = await fetch("/patientpanel/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "SMS alert sent successfully!",
        });
      } else {
        toast({
          title: "Failed",
          description: "Failed to send SMS alert.",
        });
      }
    } catch (error) {
      console.error("Failed to send SMS:", error);
      toast({
        title: "Error",
        description: "Error sending SMS alert.",
      });
    }

    // Update medicine quantities and check thresholds
    updateMedicineQuantities();
  };

  const handleRefill = async (medicine: any) => {
    try {
      const stripe = await stripePromise;

      const response = await fetch("/patientpanel/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineId: medicine.$id,
          medicineName: medicine.name,
          medicinePrice: medicine.price,
        }),
      });

      const data = await response.json();
      console.log("Checkout Session Data:", data);

      if (data.sessionId) {
        const { error } = await stripe!.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          console.error("Error redirecting to checkout:", error);
          alert("Failed to redirect to Stripe checkout.");
        }
      } else {
        alert("Failed to create Stripe checkout session.");
      }
    } catch (error) {
      console.error("Error handling refill:", error);
      alert("Failed to start refill process.");
    }
  };

  const updateMedicineQuantities = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        process.env.NEXT_PUBLIC_APPWRITE_MEDICINE_COLLECTION_ID as string
      );

      const medicines = response.documents;
      console.log("Fetched medicines:", medicines);

      for (const medicine of medicines) {
        const quantity = Number(medicine.quantity);
        const threshold = Number(medicine.threshold);

        if (quantity <= threshold) {
          console.log(
            `Medicine ${medicine.name} is below or at the threshold. Sending SMS alert.`
          );

          await fetch("patientpanel/api/send-sms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber: process.env.TWILIO_PHONE_NUMBER,
              message: `Medicine ${medicine.name} is below the threshold. Please resupply.`,
            }),
          }).catch((error) => {
            console.error("Failed to send SMS alert:", error);
          });

          const newQuantity = quantity - 5;
          console.log(
            `Updating quantity for ${medicine.name} to ${newQuantity}`
          );

          try {
            const updateResponse = await databases.updateDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
              process.env.NEXT_PUBLIC_APPWRITE_MEDICINE_COLLECTION_ID as string,
              medicine.$id,
              { quantity: newQuantity }
            );

            console.log("Update response:", updateResponse);

            if (!updateResponse) {
              console.error("Update failed. Response:", updateResponse);
            }
          } catch (updateError) {
            console.error("Error updating document:", updateError);
          }
        }
      }

      setMedicines(
        medicines.map((medicine) => ({
          ...medicine,
          quantity: Number(medicine.quantity) - 5,
        }))
      );
    } catch (error) {
      console.error("Failed to update medicine quantities:", error);
    }
  };

  const addReminder = () => {
    const reminderTime = (
      document.getElementById("reminder-time") as HTMLInputElement
    ).value;
    const reminderDays = parseInt(
      (document.getElementById("reminder-days") as HTMLInputElement).value,
      10
    );

    if (reminderTime && reminderDays > 0) {
      setReminders((prevReminders) => [
        ...prevReminders,
        { time: reminderTime, days: reminderDays },
      ]);
      toast({
        title: "Reminder Set",
        description: `Reminder set for ${reminderTime} every ${reminderDays} day(s).`,
        action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
      });
    } else {
      toast({
        title: "Invalid Input",
        description: "Please select a valid time and number of days.",
        action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
      });
    }
  };

  const removeReminder = (index: number) => {
    setReminders((prevReminders) =>
      prevReminders.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="max-w-4xl w-full mx-auto rounded-none md:rounded-2xl p-6 md:p-10 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-2xl text-neutral-800 dark:text-neutral-200 mb-6">
        Medication Reminder
      </h2>

      <div className="space-y-6 mb-8">
        <Label htmlFor="reminder-time">Reminder Time</Label>
        <Input
          id="reminder-time"
          type="time"
          defaultValue="08:00"
          className="mb-4"
        />

        <Label htmlFor="reminder-days">Number of Days</Label>
        <Input
          id="reminder-days"
          type="number"
          defaultValue={1}
          className="mb-4"
        />
        
        <Label htmlFor="phone-number">Phone Number</Label>
        <Input
          id="phone-number"
          type="text"
          defaultValue={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="mb-4"
        />

        <button
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 w-full"
          onClick={addReminder}
        >
          Set Reminder
        </button>
      </div>

      <ul className="list-disc pl-5 mb-6">
        {reminders.map((reminder, index) => (
          <li key={index} className="mb-2">
            Reminder set for {reminder.time} (For {reminder.days} days)
            <span
              className="ml-4 text-red-500 cursor-pointer"
              onClick={() => removeReminder(index)}
            >
              x
            </span>
          </li>
        ))}
      </ul>

      <div id="status" className="text-red-500 mb-4"></div>

      <button
        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
        type="submit"
        onClick={handleStopReminder}
      >
        Stop Reminder & Send SMS &rarr;
        <BottomGradient />
      </button>

      <div className="mt-10">
        <h2 className="font-bold text-2xl text-neutral-800 dark:text-neutral-200 mb-6">
          Medicines
        </h2>
        {medicines.length > 0 ? (
          medicines.map((medicine) => (
            <div
              key={medicine.$id}
              className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                {medicine.name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {medicine.description}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Price: <span className="font-semibold">${medicine.price}</span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Quantity:{" "}
                <span
                  className={
                    medicine.quantity <= medicine.threshold
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {medicine.quantity}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Threshold:{" "}
                <span className="font-semibold">{medicine.threshold}</span>
              </p>
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit"
                onClick={() => handleRefill(medicine)}
              >
                Refill &rarr;
                <BottomGradient />
              </button>
            </div>
          ))
        ) : (
          <p>No medicines found.</p>
        )}
      </div>
    </div>
  );
};

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

export default MedicationReminder;
