import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Landmark,
  RefreshCw,
  Save,
  X,
  Banknote,
} from "lucide-react";
import { Bank_account } from "@/src/types/userType";
import { useBanks } from "@/src/hooks/useBank";


type BankForm = Omit<Bank_account, "id">;

const initialForm: BankForm = {
  name: "",
  bank: "",
  tipo: "Corrente",
  saldo: 0,
  agencia: "",
  conta: "",
  isPositive: true,
  color: "#64748b",
};

export const BankDate = () => {
  const {
    banks,
    loading,
    saving,
    error,
    loadBanks,
    createBankAccount,
    saveBank,
    removeBank,
  } = useBanks();

  const [form, setForm] = useState<BankForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value) || 0);

  const updateField = <K extends keyof BankForm>(
    field: K,
    value: BankForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openCreate = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setActionError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  };

  const openEdit = (bank: Bank_account) => {
    setForm({
      name: bank.name ?? "",
      bank: bank.bank ?? "",
      tipo: bank.tipo ?? "Corrente",
      saldo: Number(bank.saldo) || 0,
      agencia: bank.agencia ?? "",
      conta: bank.conta ?? "",
      isPositive: Boolean(bank.isPositive),
      color: bank.color || "#64748b",
    });

    setEditingId(bank.id);
    setActionError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...initialForm });
    setActionError(null);
  };

  const handleSave = async () => {
    setActionError(null);
    setSuccessMessage(null);

    if (!form.name.trim() || !form.bank.trim() || !form.tipo.trim()) {
      setActionError("Preencha o nome da conta, o banco e o tipo.");
      return;
    }

    try {
      const data: BankForm = {
        ...form,
        name: form.name.trim(),
        bank: form.bank.trim(),
        tipo: form.tipo.trim(),
        saldo: Number(form.saldo) || 0,
        agencia: form.agencia.trim(),
        conta: form.conta.trim(),
        isPositive: Boolean(form.isPositive),
        color: form.color || "#64748b",
      };

      if (editingId !== null) {
        await saveBank(editingId, data);
        setSuccessMessage("Conta bancária atualizada com sucesso.");
      } else {
        await createBankAccount(data);
        setSuccessMessage("Conta bancária cadastrada com sucesso.");
      }

      closeForm();
    } catch (err) {
      console.error("Erro ao salvar conta bancária:", err);
      setActionError(
        "Não foi possível salvar a conta. Verifique os dados e tente novamente."
      );
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    
    setActionError(null);
    setSuccessMessage(null);

    try {
      await removeBank(deleteId);
      setDeleteId(null);
      setSuccessMessage("Conta bancária excluída com sucesso.");

      if (editingId === deleteId) {
        closeForm();
      }
    } catch (err) {
      console.error("Erro ao excluir conta bancária:", err);
      setActionError(
        "Não foi possível excluir a conta bancária. Tente novamente."
      );
    }
  };

  return (
    <section className="space-y-6 ">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center ">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Dados bancários
          </h2>
          
        </div>
        {banks.length <= 3 ?
        (<button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Nova conta
        </button>) : (<div></div>)
        }
      </div>

      {/* Mensagens */}
      {(actionError || error || successMessage) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            actionError || error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{actionError || error || successMessage}</span>

            {(error || actionError) && (
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  void loadBanks();
                }}
                className="inline-flex items-center gap-2 font-medium hover:underline"
              >
                <RefreshCw size={15} />
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulário na própria tela */}
      {formOpen && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="font-semibold text-slate-800">
                {editingId !== null
                  ? "Atualizar conta bancária"
                  : "Cadastrar conta bancária"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Informe os dados da conta abaixo.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar formulário"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Nome da conta */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome da conta *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex.: Conta principal"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Banco */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Banco *
                </label>
                <input
                  type="text"
                  value={form.bank}
                  onChange={(e) => updateField("bank", e.target.value)}
                  placeholder="Ex.: Banco do Brasil"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tipo de conta *
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => updateField("tipo", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Corrente">Conta corrente</option>
                  <option value="Poupança">Poupança</option>
                  <option value="Pagamento">Conta de pagamento</option>
                  <option value="Investimento">Investimento</option>
                  <option value="Caixa">Caixa</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Saldo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Saldo inicial (R$) *
                </label>
                <input
                  type="number"
                  disabled={editingId !== null}
                  value={form.saldo}
                  onChange={(e) =>
                    updateField("saldo", Number(e.target.value))
                  }
                  step="0.01"
                  required
                  className={`${editingId !== null ? `w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100` : 
                    "w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-600 font-semibold cursor-not-allowed"
                  }`}
                />
              </div>

              {/* Agência */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Agência
                </label>
                <input
                  type="text"
                  value={form.agencia}
                  onChange={(e) => updateField("agencia", e.target.value)}
                  placeholder="Número da agência"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Conta */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Número da conta
                </label>
                <input
                  type="text"
                  value={form.conta}
                  onChange={(e) => updateField("conta", e.target.value)}
                  placeholder="Número e dígito"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Cor e saldo positivo */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Cor de identificação
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <span className="text-sm text-slate-500">{form.color}</span>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isPositive}
                    onChange={(e) =>
                      updateField("isPositive", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">
                    Saldo positivo
                  </span>
                </label>
              </div>
            </div>

            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}

            {/* Botões */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />
                {saving
                  ? "Salvando..."
                  : editingId !== null
                    ? "Salvar alterações"
                    : "Cadastrar conta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carregamento */}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          <RefreshCw size={18} className="animate-spin" />
          Carregando contas bancárias...
        </div>
      )}

      {/* Lista de contas */}
      {!loading && banks.length === 0 && !formOpen && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Landmark size={32} className="mx-auto mb-4 text-slate-400" />
          <h3 className="font-semibold text-slate-800">
            Nenhuma conta cadastrada
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Clique em “Nova conta” para cadastrar a primeira conta bancária.
          </p>
        </div>
      )}

      {!loading && banks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {banks.map((account) => (
            <article
              key={account.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${account.color || "#64748b"}20`,
                      color: account.color || "#64748b",
                    }}
                  >
                    <Landmark size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-800">
                      {account.name}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {account.bank}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {account.tipo}
                </span>
              </div>

              <div className="mx-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Banknote size={17} />
                  Saldo da conta
                </div>
                <p
                  className={`mt-2 text-xl font-bold ${
                    account.isPositive
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(account.saldo)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 px-5 py-4">
                <div>
                  <p className="text-xs text-slate-500">Agência</p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-700">
                    {account.agencia || "Não informada"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Número da conta</p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-700">
                    {account.conta || "Não informada"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => openEdit(account)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    {account.saldo !== 0 ? 
                      setActionError(
                        "Não foi possível excluir conta. Saldo diferente de 0"
                      ) : setDeleteId(account.id)
                    }
                    
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Confirmação de exclusão */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={23} className="text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Excluir conta bancária?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Deseja realmente excluir esta conta? Essa operação não poderá
              ser desfeita.
            </p>

            {actionError && (
              <p className="mt-3 text-sm text-red-600">{actionError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteId(null);
                  setActionError(null);
                }}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};