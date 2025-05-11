import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';

export default function AI_Evaluate() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ミセルくん
                </h2>
            }
        >
            <Head title="AI_Evaluate" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            これはミセルくんに写真を見せるページです。
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}