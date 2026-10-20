# homebrew/rea-plus.rb — ReaPlus Homebrew formulu (hazirlik; tap yayini YOK).
# Surum kaynagi: package.json (0.13.0).
# sha256: yerel `npm pack` ciktisinin gercek olcumu (sbom.json kok hash'i ile ayni).
# Registry tarball'i `npm publish` sonrasi farkli olabilir; siseleme oncesi guncelleyin.
# Uydurma hash YOK.
class ReaPlus < Formula
  desc "Conduit live-debug core + Rea static domains over MCP stdio/HTTP"
  homepage "https://github.com/Alyhnte/ReaPlus"
  url "https://registry.npmjs.org/rea-plus/-/rea-plus-0.13.0.tgz"
  version "0.13.0"
  sha256 "b79a07083062a7425854790cf47660333246f549d6b73612a6ff0d6bf9df84c8"
  license "MIT"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    bin.write_exec_script libexec/"dist/cli/index.js", "rea-plus-cli"
    bin.write_exec_script libexec/"dist/server.js", "rea-plus"
  end

  test do
    assert_match "0.13.0", shell_output("#{bin}/rea-plus-cli --version")
  end
end
