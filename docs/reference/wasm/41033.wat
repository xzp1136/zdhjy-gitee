  (func (;41033;) (type 8) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4365129
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3391396
      call 2180
      i32.const 3391392
      call 2180
      i32.const 3388512
      call 2180
      i32.const 3391400
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3391404
      call 2180
      i32.const 3388516
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3391408
      call 2180
      i32.const 3352048
      call 2180
      i32.const 3367956
      call 2180
      i32.const 4365129
      i32.const 1
      i32.store8
    end
    i32.const 3352048
    i32.load
    call 1900
    local.tee 8
    i32.const 3391392
    i32.load
    call 35169
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.load offset=36
        local.tee 4
        if  ;; label = @3
          local.get 4
          i32.load offset=12
          i32.const 0
          i32.gt_s
          br_if 1 (;@2;)
        end
        local.get 2
        i32.load offset=12
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        loop  ;; label = @3
          local.get 2
          local.get 6
          local.get 5
          i32.const 12
          i32.add
          i32.const 3388516
          i32.load
          call 50458
          block  ;; label = @4
            local.get 5
            i32.load offset=12
            local.tee 3
            i32.eqz
            br_if 0 (;@4;)
            i32.const 0
            local.set 0
            local.get 3
            i32.load offset=16
            i32.const 0
            i32.le_s
            br_if 0 (;@4;)
            loop  ;; label = @5
              i32.const 3367956
              i32.load
              call 1900
              local.tee 4
              local.get 0
              i32.store offset=12
              local.get 4
              local.get 3
              i32.store offset=8
              local.get 8
              local.get 4
              i32.const 3391396
              i32.load
              call 50463
              local.get 0
              i32.const 1
              i32.add
              local.tee 0
              local.get 3
              i32.load offset=16
              i32.lt_s
              br_if 0 (;@5;)
            end
          end
          local.get 6
          i32.const 1
          i32.add
          local.tee 6
          local.get 2
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
        br 1 (;@1;)
      end
      i32.const 3352048
      i32.load
      call 1900
      local.tee 4
      i32.const 3391392
      i32.load
      call 35169
      local.get 2
      i32.load offset=12
      i32.const 0
      i32.gt_s
      if  ;; label = @2
        local.get 1
        i32.load offset=36
        i32.load offset=12
        local.set 11
        i32.const 0
        local.set 3
        loop  ;; label = @3
          local.get 2
          local.get 10
          local.get 5
          i32.const 12
          i32.add
          i32.const 3388516
          i32.load
          call 50458
          block  ;; label = @4
            local.get 5
            i32.load offset=12
            local.tee 9
            i32.eqz
            br_if 0 (;@4;)
            local.get 9
            i32.load offset=16
            i32.const 0
            i32.le_s
            br_if 0 (;@4;)
            i32.const 0
            local.set 6
            i32.const -1
            local.set 0
            loop  ;; label = @5
              block  ;; label = @6
                local.get 6
                i32.eqz
                if  ;; label = @7
                  local.get 3
                  local.tee 0
                  local.get 4
                  i32.load offset=12
                  i32.ge_s
                  br_if 1 (;@6;)
                  loop  ;; label = @8
                    block  ;; label = @9
                      local.get 4
                      local.get 0
                      local.get 5
                      i32.const 12
                      i32.add
                      i32.const 3391404
                      i32.load
                      call 50458
                      local.get 5
                      i32.load offset=12
                      i32.eqz
                      br_if 0 (;@9;)
                      local.get 0
                      i32.const 1
                      i32.add
                      local.tee 0
                      local.set 3
                      local.get 4
                      i32.load offset=12
                      local.get 0
                      i32.gt_s
                      br_if 1 (;@8;)
                      br 3 (;@6;)
                    end
                  end
                  local.get 0
                  local.set 3
                  br 1 (;@6;)
                end
                local.get 1
                i32.load offset=36
                local.get 6
                i32.const 1
                i32.sub
                local.get 11
                i32.rem_s
                local.get 5
                i32.const 12
                i32.add
                i32.const 3387848
                i32.load
                call 50458
                local.get 5
                i32.load offset=12
                local.tee 7
                i32.const 0
                local.get 7
                i32.const 0
                i32.gt_s
                select
                local.get 0
                i32.add
                local.set 0
                loop  ;; label = @7
                  local.get 0
                  i32.const 1
                  i32.add
                  local.tee 0
                  local.get 4
                  i32.load offset=12
                  i32.ge_s
                  br_if 1 (;@6;)
                  local.get 4
                  local.get 0
                  local.get 5
                  i32.const 12
                  i32.add
                  i32.const 3391404
                  i32.load
                  call 50458
                  local.get 5
                  i32.load offset=12
                  br_if 0 (;@7;)
                end
              end
              local.get 0
              local.get 4
              i32.load offset=12
              i32.ge_s
              if  ;; label = @6
                loop  ;; label = @7
                  local.get 4
                  i32.const 0
                  i32.const 3391396
                  i32.load
                  call 50463
                  local.get 4
                  i32.load offset=12
                  local.get 0
                  i32.le_s
                  br_if 0 (;@7;)
                end
              end
              i32.const 3367956
              i32.load
              call 1900
              local.tee 7
              local.get 6
              i32.store offset=12
              local.get 7
              local.get 9
              i32.store offset=8
              local.get 4
              local.get 0
              local.get 7
              i32.const 3391408
              i32.load
              call 50459
              block  ;; label = @6
                local.get 0
                local.get 3
                i32.ne
                br_if 0 (;@6;)
                local.get 0
                local.set 3
                local.get 0
                local.get 4
                i32.load offset=12
                i32.ge_s
                br_if 0 (;@6;)
                loop  ;; label = @7
                  local.get 4
                  local.get 3
                  local.get 5
                  i32.const 12
                  i32.add
                  i32.const 3391404
                  i32.load
                  call 50458
                  local.get 5
                  i32.load offset=12
                  i32.eqz
                  br_if 1 (;@6;)
                  local.get 3
                  i32.const 1
                  i32.add
                  local.tee 3
                  local.get 4
                  i32.load offset=12
                  i32.lt_s
                  br_if 0 (;@7;)
                end
              end
              local.get 6
              i32.const 1
              i32.add
              local.tee 6
              local.get 9
              i32.load offset=16
              i32.lt_s
              br_if 0 (;@5;)
            end
          end
          local.get 10
          i32.const 1
          i32.add
          local.tee 10
          local.get 2
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
      end
      local.get 4
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 0
      loop  ;; label = @2
        local.get 4
        local.get 0
        local.get 5
        i32.const 12
        i32.add
        i32.const 3391404
        i32.load
        call 50458
        local.get 5
        i32.load offset=12
        if  ;; label = @3
          local.get 4
          local.get 0
          local.get 5
          i32.const 12
          i32.add
          i32.const 3391404
          i32.load
          call 50458
          local.get 8
          local.get 5
          i32.load offset=12
          i32.const 3391396
          i32.load
          call 50463
        end
        local.get 0
        i32.const 1
        i32.add
        local.tee 0
        local.get 4
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 8)
