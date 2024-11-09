"use client";
import { tryGetPackage } from "@/lib/api";
import { fetchReadme } from "@/lib/readme-fetcher";
import { redirect } from "next/navigation";
import { Image } from "@nextui-org/image";
import { useEffect, useState, useCallback, useMemo } from "react";
import { GetPackageResponse } from "@/lib/api";
import { FaStar, FaTag } from "react-icons/fa6";
import { Spinner } from "@nextui-org/react";
import { motion } from "framer-motion";
import InstallButton from "@/components/plugin/install-button";
import PluginTabs from "@/components/plugin/tabs";
import SideBar from "@/components/plugin/side-bar";
import { Link } from "@nextui-org/link";

export default function Page({ params }: { params: { identifier: string[] } }) {
  const [pkg, setPkg] = useState<GetPackageResponse | undefined>(undefined);
  const [readme, setReadme] = useState<any>(undefined);
  const [error, setError] = useState<boolean | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    if (params.identifier.length >= 2) {
      const identifier = params.identifier.slice(0, 3).join("/");

      const response = await tryGetPackage(identifier);
      if (response.err) {
        setError(true);
        setLoading(false);
        redirect("/404");
      } else {
        const identifierReadme = params.identifier.slice(1, 3).join("/");
        const readmeData = await fetchReadme("github", identifierReadme);
        setPkg(response.val);
        setReadme(readmeData);
        setLoading(false);
      }
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto max-w-7xl px-6 flex-grow">
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner label="Loading" size="lg" color="default" />
        </div>
      ) : (
        <div>
          <div className="flex flex-col space-y-4">
            <motion.div
              className="flex"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="flex-shrink-0 p-4">
                <Image
                  src={
                    pkg?.avatarUrl ||
                    "https://stickerly.pstatic.net/sticker_pack/8cP1NeB69qFawu3Cn0vA/SL4DEZ/20/5e094b29-a0b9-4c95-8359-71af47910afb.png"
                  }
                  className="rounded-3xl"
                  width={80}
                  height={80}
                  alt="avatar"
                />
              </div>
              <div className="flex-grow p-4 min-w-0">
                <div className="flex flex-col h-full">
                  <div className="mb-2">
                    <h3 className="font-semibold text-foreground/90">
                      <span className="text-large">
                        <Link
                          size="lg"
                          color="foreground"
                          href={`https://github.com/${pkg?.author}`}
                        >
                          {pkg?.author}
                        </Link>
                        &nbsp;/&nbsp;
                        <Link
                          size="lg"
                          color="foreground"
                          href={`https://github.com/${pkg?.author}/${pkg?.name}`}
                        >
                          {pkg?.name}
                        </Link>
                      </span>
                    </h3>
                    <p className="text-medium text-foreground/80">
                      {pkg?.description}
                    </p>
                  </div>
                  <div className="mt-2 flex text-gray-500 items-center">
                    <div className="flex items-center gap-2 pr-4 font-semibold dark:border-gray-600 dark:text-gray-400">
                      <FaStar />
                      <span>{pkg?.hotness}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 p-4 min-w-[150px]">
                <InstallButton pkg={pkg || ({} as GetPackageResponse)} />
              </div>
            </motion.div>
            <hr className="border-foreground/20" />
            <div className="flex flex-col lg:flex-row lg:space-x-4">
              <div className="flex-1 min-w-0">
                <PluginTabs
                  pkg={pkg || ({} as GetPackageResponse)}
                  identifier={params.identifier}
                  readme={readme}
                />
              </div>
              <div className="flex flex-col space-y-4 lg:w-1/4 lg:flex-shrink-0">
                <SideBar pkg={pkg || ({} as GetPackageResponse)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
