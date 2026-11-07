  (func (;41030;) (type 8) (param i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4365133
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3376288
      call 2180
      i32.const 3375568
      call 2180
      i32.const 3375576
      call 2180
      i32.const 3375580
      call 2180
      i32.const 3346600
      call 2180
      i32.const 3353480
      call 2180
      i32.const 3357332
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3359256
      call 2180
      i32.const 3387144
      call 2180
      i32.const 3387136
      call 2180
      i32.const 3391400
      call 2180
      i32.const 3387156
      call 2180
      i32.const 3391404
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3351236
      call 2180
      i32.const 3432328
      call 2180
      i32.const 3479712
      call 2180
      i32.const 3482376
      call 2180
      i32.const 3481264
      call 2180
      i32.const 3479708
      call 2180
      i32.const 3482360
      call 2180
      i32.const 4365133
      i32.const 1
      i32.store8
    end
    local.get 3
    i32.const 0
    i32.store offset=4
    i32.const 3346600
    i32.load
    call 1900
    local.tee 9
    i32.const 3375568
    i32.load
    call 34422
    i32.const 3353480
    i32.load
    i32.const 4
    call 2185
    local.tee 7
    i32.const 3432328
    i32.load
    i32.const 0
    call 52128
    local.get 7
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      loop  ;; label = @2
        local.get 7
        local.get 4
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        local.set 5
        i32.const 3351236
        i32.load
        call 1900
        local.tee 6
        i32.const 3387136
        i32.load
        call 35169
        i32.const 3375580
        i32.load
        local.set 8
        local.get 3
        local.get 5
        i32.store offset=12
        local.get 9
        local.get 3
        i32.const 12
        i32.add
        local.get 6
        local.get 8
        call 34436
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 7
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 3
    local.get 1
    local.get 2
    local.get 3
    call 41033
    local.tee 2
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      i32.const 0
      local.set 6
      loop  ;; label = @2
        local.get 2
        local.get 6
        local.get 3
        i32.const 12
        i32.add
        i32.const 3391404
        i32.load
        call 50458
        block  ;; label = @3
          local.get 3
          i32.load offset=12
          local.tee 4
          i32.eqz
          br_if 0 (;@3;)
          local.get 4
          i32.load offset=8
          local.tee 5
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load offset=16
          i32.const 0
          i32.le_s
          if  ;; label = @4
            local.get 3
            local.get 5
            i32.load offset=8
            i32.store offset=12
            i32.const 3359088
            i32.load
            local.get 3
            i32.const 12
            i32.add
            call 2193
            local.set 4
            local.get 3
            local.get 5
            i32.load offset=16
            i32.store offset=8
            i32.const 3359088
            i32.load
            local.get 3
            i32.const 8
            i32.add
            call 2193
            local.set 5
            i32.const 3482376
            i32.load
            local.get 4
            local.get 5
            i32.const 0
            call 48227
            local.set 4
            i32.const 3356428
            i32.load
            local.tee 5
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 5
              call 60460
            end
            local.get 4
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          local.get 4
          i32.load offset=12
          local.set 12
          local.get 5
          i32.load offset=12
          local.set 8
          i32.const 3359256
          i32.load
          local.tee 4
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 4
            call 60460
            i32.const 3359256
            i32.load
            local.set 4
          end
          i32.const 3376288
          i32.load
          local.set 10
          local.get 4
          i32.load offset=92
          i32.load
          local.set 4
          local.get 3
          local.get 8
          i32.store offset=12
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          local.get 3
          i32.const 4
          i32.add
          local.get 10
          call 34286
          i32.eqz
          if  ;; label = @4
            local.get 3
            local.get 8
            i32.store offset=12
            i32.const 3359088
            i32.load
            local.get 3
            i32.const 12
            i32.add
            call 2193
            local.set 4
            i32.const 3482360
            i32.load
            local.get 4
            i32.const 0
            call 48011
            local.set 4
            i32.const 3356428
            i32.load
            local.tee 5
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 5
              call 60460
            end
            local.get 4
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          local.get 3
          local.get 13
          local.get 7
          local.get 9
          local.get 1
          local.get 3
          call 41034
          local.set 13
          local.get 3
          local.get 5
          local.get 12
          local.get 3
          i32.load offset=4
          local.get 7
          local.get 13
          i32.const 2
          i32.shl
          i32.add
          i32.load offset=16
          local.tee 12
          local.get 3
          call 41035
          local.set 10
          i32.const 4365134
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3388080
            call 2180
            i32.const 3388084
            call 2180
            i32.const 4365134
            i32.const 1
            i32.store8
          end
          i32.const 0
          local.set 4
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.load offset=60
              local.tee 5
              i32.load offset=12
              i32.const 0
              i32.gt_s
              if  ;; label = @6
                loop  ;; label = @7
                  local.get 5
                  local.get 4
                  local.get 3
                  i32.const 12
                  i32.add
                  i32.const 3388084
                  i32.load
                  call 50458
                  local.get 8
                  local.get 3
                  i32.load offset=12
                  local.tee 5
                  i32.load offset=20
                  i32.eq
                  if  ;; label = @8
                    local.get 5
                    i32.load offset=28
                    i32.eqz
                    br_if 3 (;@5;)
                  end
                  local.get 4
                  i32.const 1
                  i32.add
                  local.tee 4
                  local.get 0
                  i32.load offset=60
                  local.tee 5
                  i32.load offset=12
                  i32.lt_s
                  br_if 0 (;@7;)
                end
              end
              i32.const 3375576
              i32.load
              local.set 4
              local.get 3
              local.get 12
              i32.store offset=12
              local.get 9
              local.get 3
              i32.const 12
              i32.add
              local.get 3
              i32.const 8
              i32.add
              local.get 4
              call 34434
              local.get 3
              i32.load offset=8
              local.get 10
              i32.const 3387144
              i32.load
              call 50463
              br 1 (;@4;)
            end
            local.get 5
            local.get 10
            i32.store offset=28
          end
          local.get 11
          i32.const 1
          i32.add
          local.set 11
        end
        local.get 6
        i32.const 1
        i32.add
        local.tee 6
        local.get 2
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 0
    local.get 1
    local.get 9
    local.get 7
    local.get 3
    call 41036
    local.get 7
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      i32.const 0
      local.set 4
      loop  ;; label = @2
        local.get 7
        local.get 4
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        local.set 6
        local.get 1
        i32.load offset=28
        local.get 4
        local.get 3
        i32.const 12
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        local.get 3
        i32.load offset=12
        i32.const 0
        local.get 3
        i32.const 12
        i32.add
        i32.const 3387848
        i32.load
        call 50458
        local.get 3
        i32.load offset=12
        local.set 5
        i32.const 3375576
        i32.load
        local.set 8
        local.get 3
        local.get 6
        i32.store offset=12
        local.get 9
        local.get 3
        i32.const 12
        i32.add
        local.get 3
        i32.const 8
        i32.add
        local.get 8
        call 34434
        block  ;; label = @3
          block  ;; label = @4
            local.get 3
            i32.load offset=8
            i32.load offset=12
            local.tee 8
            local.get 5
            i32.const 0
            local.get 5
            i32.const 0
            i32.gt_s
            select
            local.tee 5
            i32.le_s
            br_if 0 (;@4;)
            local.get 4
            local.get 7
            i32.load offset=12
            i32.const 1
            i32.sub
            i32.ne
            br_if 0 (;@4;)
            local.get 3
            local.get 6
            i32.store offset=12
            i32.const 3357332
            i32.load
            local.get 3
            i32.const 12
            i32.add
            call 2193
            local.set 6
            local.get 3
            local.get 5
            i32.store offset=8
            i32.const 3359088
            i32.load
            local.get 3
            i32.const 8
            i32.add
            call 2193
            local.set 5
            local.get 3
            local.get 8
            i32.store
            i32.const 3359088
            i32.load
            local.get 3
            call 2193
            local.set 8
            i32.const 3479712
            i32.load
            local.get 6
            local.get 5
            local.get 8
            i32.const 0
            call 48228
            local.set 5
            i32.const 3356428
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            local.get 5
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          local.get 3
          local.get 6
          i32.store offset=12
          i32.const 3357332
          i32.load
          local.get 3
          i32.const 12
          i32.add
          call 2193
          local.set 6
          local.get 3
          local.get 5
          i32.store offset=8
          i32.const 3359088
          i32.load
          local.get 3
          i32.const 8
          i32.add
          call 2193
          local.set 5
          local.get 3
          local.get 8
          i32.store
          i32.const 3359088
          i32.load
          local.get 3
          call 2193
          local.set 8
          i32.const 3479708
          i32.load
          local.get 6
          local.get 5
          local.get 8
          i32.const 0
          call 48228
          local.set 5
          i32.const 3356428
          i32.load
          local.tee 6
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 6
            call 60460
          end
          local.get 5
          i32.const 0
          call 55817
        end
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 7
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 0
    local.get 11
    i32.store offset=28
    local.get 0
    local.get 11
    i32.store offset=24
    local.get 3
    local.get 11
    i32.store offset=12
    i32.const 3359088
    i32.load
    local.get 3
    i32.const 12
    i32.add
    call 2193
    local.set 7
    i32.const 3481264
    i32.load
    local.get 7
    i32.const 0
    call 48011
    local.set 7
    i32.const 3356428
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    local.get 7
    i32.const 0
    call 55817
    local.get 3
    i32.const 16
    i32.add
    global.set 0
    local.get 9)
