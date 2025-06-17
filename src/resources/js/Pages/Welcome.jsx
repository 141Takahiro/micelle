import { Head, Link } from '@inertiajs/react';
import micelle_bg from "../assets/layout/micelle-bg.jpg";
import micelleImage from "../assets/icons/micelle.jpg";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <img
                    id="background"
                    className="absolute top-0 w-full h-full object-cover opacity-100"
                    src={micelle_bg}
                />
                <div className="relative flex min-h-screen flex-col items-center justify-center">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                 <img src={micelleImage} alt="ミセルロゴ" className="h-32" />
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="group flex items-center rounded-md px-3 py-2 text-black hover:bg-gray-100"
                                    >
                                        Home
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="group flex items-center rounded-md px-3 py-2 text-black hover:bg-gray-100"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="group flex items-center rounded-md px-3 py-2 text-black hover:bg-gray-100"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            <div>
                                <h1 className="py-16 text-center text-xl text-black">Micelleへようこそ。</h1>
                                <p className="py-4 text-center text-m text-black">MicelleはAIによる画像診断機能つき清掃管理アプリです。</p>
                            </div>
                        </main>

                        <footer className="py-16 text-center text-sm text-black">
                            2025 Created by Takahiro Ishii. 
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
