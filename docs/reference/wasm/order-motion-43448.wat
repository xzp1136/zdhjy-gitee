  (func (;43448;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366750
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3408192
      call 2180
      i32.const 3387256
      call 2180
      i32.const 3385828
      call 2180
      i32.const 3385832
      call 2180
      i32.const 3387260
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3413776
      call 2180
      i32.const 4366750
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=60
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.load offset=56
        local.tee 1
        i32.load offset=12
        i32.const 0
        i32.gt_s
        if  ;; label = @3
          loop  ;; label = @4
            local.get 1
            local.get 6
            local.get 2
            i32.const 12
            i32.add
            i32.const 3385832
            i32.load
            call 50458
            local.get 2
            i32.load offset=12
            local.tee 3
            i32.load offset=12
            i32.const 0
            i32.gt_s
            if  ;; label = @5
              i32.const 0
              local.set 1
              loop  ;; label = @6
                local.get 3
                local.get 1
                local.get 2
                i32.const 12
                i32.add
                i32.const 3387260
                i32.load
                call 50458
                local.get 2
                i32.load offset=12
                local.set 4
                i32.const 3360788
                i32.load
                local.tee 5
                i32.load offset=116
                i32.eqz
                if  ;; label = @7
                  local.get 5
                  call 60460
                end
                local.get 4
                i32.const 0
                i32.const 0
                call 48812
                if  ;; label = @7
                  local.get 3
                  local.get 1
                  local.get 2
                  i32.const 12
                  i32.add
                  i32.const 3387260
                  i32.load
                  call 50458
                  local.get 2
                  i32.load offset=12
                  local.get 2
                  i32.const 12
                  i32.add
                  i32.const 3408192
                  i32.load
                  call 45354
                  local.get 2
                  i32.load offset=12
                  local.set 4
                  i32.const 3360788
                  i32.load
                  local.tee 5
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 5
                    call 60460
                  end
                  local.get 4
                  i32.const 0
                  i32.const 0
                  call 48812
                  if  ;; label = @8
                    local.get 4
                    i32.const 0
                    i32.const 0
                    call 20479
                  end
                  i32.const 4367473
                  i32.load8_u
                  i32.eqz
                  if  ;; label = @8
                    i32.const 3360844
                    call 2180
                    i32.const 4367473
                    i32.const 1
                    i32.store8
                  end
                  i32.const 3360844
                  i32.load
                  i32.load offset=92
                  i32.load
                  local.set 4
                  local.get 3
                  local.get 1
                  local.get 2
                  i32.const 12
                  i32.add
                  i32.const 3387260
                  i32.load
                  call 50458
                  local.get 4
                  local.get 2
                  i32.load offset=12
                  i32.const 0
                  call 43866
                end
                local.get 1
                i32.const 1
                i32.add
                local.tee 1
                local.get 3
                i32.load offset=12
                i32.lt_s
                br_if 0 (;@6;)
              end
            end
            local.get 6
            i32.const 1
            i32.add
            local.tee 6
            local.get 0
            i32.load offset=56
            local.tee 1
            i32.load offset=12
            i32.lt_s
            br_if 0 (;@4;)
          end
        end
        local.get 0
        i32.load offset=60
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 3
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 3
          call 60460
        end
        local.get 1
        i32.const 0
        call 48975
        local.get 0
        i32.const 0
        i32.store offset=60
        i32.const 3354340
        i32.load
        call 1900
        local.tee 1
        local.get 0
        i32.const 3413776
        i32.load
        i32.const 0
        call 38015
        local.get 0
        local.get 1
        i32.const 0
        call 43914
        drop
        br 1 (;@1;)
      end
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.load offset=96
      local.get 2
      call 43411
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)
