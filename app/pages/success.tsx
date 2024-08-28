// pages/success.tsx
"use client";
import { useRouter } from 'next/router';
import { Client, Databases } from 'appwrite';
import { useEffect, useState } from 'react';

const Success = () => {
    const router = useRouter();
    const [orderId, setOrderId] = useState<string | null>(null);

    const { medicineId } = router.query;

    useEffect(() => {
        if (medicineId) {
            createOrder(medicineId as string);
        }
    }, [medicineId]);

    const createOrder = async (medicineId: string) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

        const databases = new Databases(client);

        try {
            // Fetch medicine details from Appwrite
            const medicineResponse = await databases.getDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
                process.env.NEXT_PUBLIC_APPWRITE_MEDICINE_COLLECTION_ID as string,
                medicineId
            );

            const medicinePrice = medicineResponse.price; // Assuming price is stored in the response

            // Create the order
            const orderResponse = await databases.createDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
                process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID as string,
                'unique()', // Generate unique ID for the order
                {
                    medicineId,
                    quantity: 1, // For simplicity, assume 1 unit is ordered
                    price: medicinePrice, // Use the fetched price
                    status: 'Paid',
                    createdAt: new Date().toISOString(),
                }
            );

            setOrderId(orderResponse.$id); // Save the order ID
        } catch (error) {
            console.error('Failed to create order in Appwrite:', error);
        }
    };

    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Order Successful!</h1>
            <p className="mb-4">Thank you for your purchase. Your order has been successfully processed.</p>
            {orderId && (
                <div className="mb-4">
                    <p className="font-semibold">Order ID:</p>
                    <p className="bg-gray-700 p-2 rounded">{orderId}</p>
                </div>
            )}
            <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default Success;
