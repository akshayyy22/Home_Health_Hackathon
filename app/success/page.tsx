// app/success/page.tsx

"use client";
import { Client, Databases } from 'appwrite';
import { useEffect, useState } from 'react';

const SuccessPage = ({ searchParams }: { searchParams: { medicineId?: string } }) => {
    const medicineId = searchParams.medicineId;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (medicineId) {
            createOrder(medicineId).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [medicineId]);

    const handleGoBack = () => {
        window.location.href = '/patientpanel/dashboard';
    };

    if (loading) {
        return <div className="container"><p>Processing your order...</p></div>;
    }

    return (
        <div className="container">
            <div className="message">
                <h1>Order Successful!</h1>
                <p>Thank you for your purchase. </p>
                <p>Order Has Been Placed to the MedPlus.</p>
                <button onClick={handleGoBack} className="back-button">
                    Go Back to Dashboard
                </button>
            </div>
            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #000; /* Black background */
                    color: #fff; /* White text color */
                    padding: 0 2rem;
                    box-sizing: border-box;
                }
                .message {
                    text-align: center;
                    background-color: #1a202c; /* Dark grey background for message box */
                    padding: 2rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                }
                h1 {
                    color: #38b2ac; /* Teal color for the heading */
                    margin-bottom: 0.5rem;
                }
                p {
                    color: #e2e8f0; /* Lighter grey for the paragraph text */
                    margin-bottom: 1.5rem;
                }
                .back-button {
                    background-color: #38b2ac; /* Teal background color */
                    color: #000; /* Black text color */
                    border: none;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
                }
                .back-button:hover {
                    background-color: #319795; /* Slightly darker teal on hover */
                    transform: translateY(-2px); /* Lift effect on hover */
                }
            `}</style>
        </div>
    );
};

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
        await databases.createDocument(
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
    } catch (error) {
        console.error('Failed to create order in Appwrite:', error);
    }
};

export default SuccessPage;
